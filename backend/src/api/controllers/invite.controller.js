import * as inviteService from '../services/invite.service.js';
import { sendResponse } from '../library/utils.js';
import { io } from '../../config/socket.js';

export const getInvites = async (req, res, next) => {
  try {
    const invites = await inviteService.getInvitesService(req);
    return sendResponse(
      res,
      200,
      true,
      'Invites retrieved successfully',
      invites,
    );
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const { inviteId } = req.params;

    const member = await inviteService.acceptInviteService(req, inviteId);

    io.to(member.invitedBy.toString()).emit(
      'board:member:inviteAccepted',
      member,
    );

    return sendResponse(res, 200, true, 'Invite accepted successfully');
  } catch (error) {
    next(error);
  }
};

export const declineInvite = async (req, res, next) => {
  try {
    const { inviteId } = req.params;
    const inviteDeclined = await inviteService.declineInviteService(
      req,
      inviteId,
    );

    return sendResponse(res, 200, true, 'Invite declined successfully');
  } catch (error) {
    next(error);
  }
};
