/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import { userDTO, userMinimalDTO } from '../dto/user.dto.js';
import { documentsDto } from '../dto/documents.dto.js';
import cartModel from '../dao/models/cart.model.js';
import userModel from '../dao/models/user.model.js';
import { emailSender } from '../utils/mailing/emailSender.js';

const getAllUsers = async () => {
  try {
    const users = await userModel.find({});
    const result = users.map((user) => userMinimalDTO(user));
    return { status: 200, result };
  } catch (error) {
    return { status: 404, message: error.message };
  }
};

const getAllUsersManager = async (req) => {
  try {
    const limit = req.query.limit || undefined;
    const page = req.query.page || 1;
    const email = req.query.email || null;
    const role = req.query.role || null;
    const cart = req.query.cart || null;
    const query = {
      ...(email && { email }),
      ...(role && { role }),
      ...(cart && { cart })
    };

    // if limit has a value, users will be returned with no pagination
    if (limit === 'all' || limit > 0) {
      let users = limit === 'all' ? await userModel.find(query).lean().exec() : await userModel.find(query).limit(parseInt(limit)).lean().exec();
      users = users.map((user) => userDTO(user));

      const resObj = {
        status: 200,
        payload: users,
        count: users.length
      };
      return resObj;
    }

    // if there is no query params, all users will be returned with pagination
    const users = await userModel.paginate(query, { page, limit: 10 });
    users.docs = users.docs.map((user) => userDTO(user));

    const loopedPages = [];
    for (let i = 1; i <= users.totalPages; i++) {
      loopedPages.push({
        page: i,
        active: i === users.page - 1
      });
    }

    const resObj = {
      status: 200,
      payload: users.docs,
      totalPages: users.totalPages,
      prevPage: users.prevPage,
      nextPage: users.nextPage,
      page: users.page || null,
      hasPrevPage: users.hasPrevPage,
      hasNextPage: users.hasNextPage,
      prevLink: users.hasPrevPage ? `/usersmanager?page=${users.prevPage}` : null,
      nextLink: users.hasNextPage ? `/usersmanager?page=${users.nextPage}` : null,
      count: users.docs.length,
      totalCount: users.totalDocs,
      loopedPages
    };
    return resObj;
  } catch (error) {
    const resObj = {
      status: 400,
      message: 'There was an error while querying the database',
      payload: [],
      totalPages: 0,
      prevPage: null,
      nextPage: null,
      page: null,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null,
      count: null,
      totalCount: null
    };
    req.log.error(`[users-getAllUsersManager] ${error.message}`);
    return resObj;
  }
};

const updateUser = async (userId, user) => {
  try {
    const findUser = await userModel.findByIdAndUpdate(userId, user, { new: true });
    // const result = userDTO(findUser);
    return { status: 200, message: 'User updated' };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

const updateUserCart = async (userId, cartId) => {
  try {
    const findCart = await cartModel.findById(cartId);
  } catch (error) {
    return { status: 404, message: 'Cart not found' };
  }

  try {
    const findUser = updateUser(userId, { cart: cartId });
    return { status: 200, message: 'User updated' };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

const deleteUser = async (userId) => {
  try {
    const findUser = await userModel.findByIdAndDelete(userId);
    return { status: 200, message: 'User deleted' };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

const updateUserPremium = async (userId) => {
  try {
    const findUser = await userModel.findById(userId);
    if (findUser.role === 'user' && findUser.documents.length < 3) {
      return { status: 400, message: 'User did not provide enough documents to be upgraded to premium' };
    }
    const newRole = findUser.role === 'user' ? 'premium' : 'user';
    await userModel.findByIdAndUpdate(userId, { role: newRole }, { new: true });
    return { status: 200, message: `User role updated to ${newRole}` };
  } catch (error) {
    return { status: 404, message: 'User not found' };
  }
};

const uploadDocuments = async (userId, documents) => {
  try {
    const user = await userModel.findById(userId);
    // Gets the user documents
    const userDocuments = user.documents;

    // Maps the uploaded documents to the user documents format
    const uploadedDocuments = Object.keys(documents).map((key) => {
      const document = documents[key];
      const { fieldname, originalname, path } = document[0];
      return { fieldname, name: originalname, reference: path };
    });

    // Checks if there are repeated documents and replaces them with the new ones
    const finalDocumentsNotRepeated = [
      ...userDocuments,
      ...uploadedDocuments
    ].reduce((acc, curr) => {
      const repeated = acc.find((doc) => doc.fieldname === curr.fieldname);
      if (!repeated) {
        acc.push(curr);
      } else {
        const repeatedIndex = acc.findIndex((doc) => doc.fieldname === curr.fieldname);
        acc[repeatedIndex] = curr;
      }
      return acc;
    }, []);

    const result = await userModel.findOneAndUpdate({ _id: userId }, { documents: finalDocumentsNotRepeated }, { new: true });
    // if the user has the required documents, it will update the role to premium
    if (result.documents.length === 3) { await updateUserPremium(userId); }
    return { status: 200, documents: documentsDto(result.documents), message: `Updated documents for user ${userId}` };
  } catch (error) {
    return { status: 404, message: error };
  }
};

const getUserDocuments = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const documents = documentsDto(user.documents);
    return { status: 200, documents };
  } catch (error) {
    return { status: 404, message: error };
  }
};

const deleteInactiveUsers = async () => {
  try {
    // 172800000 = 48 hours in milliseconds
    const deletedCount = [];
    const findInactive = await userModel.find({ last_connection: { $lt: new Date(Date.now() - 172800000) } });
    if (findInactive.length === 0) { return { status: 404, message: 'No inactive users found' }; }

    // Send email to each inactive user to notify them that their account will be deleted
    const promises = findInactive.map(async (user) => {
      const data = {
        user: {
          firstName: user.firstName,
          email: user.email
        }
      };
      await userModel.findByIdAndDelete(user._id);
      await emailSender('inactive_user', data);
      deletedCount.push(user._id);
    });
    await Promise.all(promises);

    return { status: 200, message: `${deletedCount.length} inactive user(s) deleted` };
  } catch (error) {
    return { status: 404, message: error };
  }
};

export const usersService = {
  getAllUsers,
  getAllUsersManager,
  updateUser,
  updateUserCart,
  deleteUser,
  updateUserPremium,
  uploadDocuments,
  getUserDocuments,
  deleteInactiveUsers
};
