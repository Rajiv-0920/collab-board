import mongoose from 'mongoose';
import InviteBoard from '../models/inviteBoard.model.js';
import BoardMember from '../models/boardMember.model.js';
import User from '../models/user.model.js';
import Board from '../models/board.model.js';

export const getInvitesService = async (req) => {
  const invites = await InviteBoard.find({ inviteeId: req.user._id })
    .sort({
      createdAt: -1,
    })
    .populate('boardId', 'title')
    .populate('invitedBy', 'name avatarUrl');
  return invites;
};

export const acceptInviteService = async (req, inviteId) => {
  const session = await mongoose.startSession();

  let expiredInvite = false;
  let acceptedInvite = null;
  let member = null;

  try {
    await session.withTransaction(async () => {
      const invite = await InviteBoard.findOne({
        _id: inviteId,
        inviteeId: req.user._id,
      }).session(session);

      if (!invite) {
        const error = new Error('Invite not found');
        error.statusCode = 404;
        throw error;
      }

      if (invite.status !== 'pending') {
        const error = new Error('Invite is not pending');
        error.statusCode = 400;
        throw error;
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        await InviteBoard.updateOne(
          {
            _id: invite._id,
            status: 'pending',
          },
          {
            $set: {
              status: 'expired',
            },
          },
          {
            session,
          },
        );

        expiredInvite = true;
        return;
      }

      const existingMember = await BoardMember.findOne({
        boardId: invite.boardId,
        userId: req.user._id,
      }).session(session);

      if (existingMember) {
        const error = new Error('User is already a member');
        error.statusCode = 409;
        throw error;
      }

      // Create the membership.
      member = await BoardMember.create(
        [
          {
            boardId: invite.boardId,
            userId: req.user._id,
            role: invite.role,
            invitedBy: invite.invitedBy,
          },
        ],
        { session },
      );

      // Mark invite as accepted.
      const updatedInvite = await InviteBoard.findOneAndUpdate(
        {
          _id: invite._id,
          status: 'pending',
        },
        {
          $set: {
            status: 'accepted',
          },
        },
        {
          returnDocument: 'after',
          session,
        },
      );
      await updatedInvite.populate('invitedBy');
      acceptedInvite = updatedInvite;
    });

    if (expiredInvite) {
      const error = new Error('Invite has expired');
      error.statusCode = 400;
      throw error;
    }

    const populatedMember = await BoardMember.findById(member[0]._id)
      .populate('userId', 'name email avatarUrl')
      .lean()
      .session(session);

    return populatedMember;
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateError = new Error(
        'User is already a member of this board',
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const declineInviteService = async (req, inviteId) => {
  const invite = await InviteBoard.findOneAndUpdate(
    {
      _id: inviteId,
      inviteeId: req.user._id,
      status: 'pending',
    },
    {
      $set: {
        status: 'declined',
      },
    },
    {
      returnDocument: 'after',
    },
  );

  if (!invite) {
    const error = new Error('Invite not found');
    error.statusCode = 404;
    throw error;
  }

  await invite.populate('inviteeId');

  return invite;
};
