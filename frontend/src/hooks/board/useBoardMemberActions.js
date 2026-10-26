import { getId } from '@/lib/ids';
import {
  useAddMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
} from '../../services/boardsApi';

export const useBoardMemberActions = ({
  boardId,
  isOwner,
  setDeleteDialog,
  showError,
  showSuccess,
}) => {
  const [addMemberMutation] = useAddMemberMutation();
  const [updateMemberMutation] = useUpdateMemberMutation();
  const [removeMemberMutation] = useRemoveMemberMutation();

  const inviteMember = async ({ email, role }) => {
    if (!isOwner) return;

    try {
      await addMemberMutation({ boardId, email, role }).unwrap();
      showSuccess(`Invitation sent to ${email}.`);
    } catch (error) {
      showError(error, 'Could not invite this member.');
      throw error;
    }
  };

  const changeMemberRole = async (member, role) => {
    if (!isOwner) return;

    try {
      await updateMemberMutation({
        boardId,
        memberId: getId(member.userId),
        role,
      }).unwrap();

      showSuccess('Member role updated successfully.');
    } catch (error) {
      showError(error, 'Could not update the member role.');
      throw error;
    }
  };

  const removeMember = (member) => {
    if (!isOwner) return;

    const memberName = member.userId?.name ?? 'this member';

    setDeleteDialog({
      title: 'Remove this member?',
      description:
        'This member will lose access to this board. You can invite them again later.',
      itemName: memberName,
      details: member.userId?.email ?? 'Board member',
      onConfirm: async () => {
        try {
          await removeMemberMutation({
            boardId,
            memberId: getId(member.userId),
          }).unwrap();

          showSuccess('Member removed successfully.');
          setDeleteDialog(null);
        } catch (error) {
          showError(error, 'Could not remove the member.');
        }
      },
    });
  };

  return {
    inviteMember,
    changeMemberRole,
    removeMember,
  };
};
