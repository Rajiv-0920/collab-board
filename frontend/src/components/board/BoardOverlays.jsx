import EditBoardDialog from '@/components/board/EditBoardDialog';
import AddCardSheet from '@/components/board/AddCardSheet';
import MembersDialog from '@/components/board/MembersDialog';
import ActivitySheet from '@/components/board/ActivitySheet';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

const BoardOverlays = ({
  isOwner,
  editBoardOpen,
  setEditBoardOpen,
  board,
  editBoard,
  selectedCard,
  setSelectedCardId,
  selectedCardList,
  members,
  isUpdatingCard,
  saveCard,
  membersOpen,
  setMembersOpen,
  currentUserId,
  inviteMember,
  changeMemberRole,
  removeMember,
  activityOpen,
  setActivityOpen,
  activities,
  hasMoreActivity,
  isLoadingActivity,
  isFetchingActivity,
  activityPage,
  loadMoreActivity,
  deleteDialog,
  setDeleteDialog,
  isDeleting,
  setIsDeleting,
}) => {
  return (
    <>
      {isOwner && (
        <EditBoardDialog
          open={editBoardOpen}
          onOpenChange={setEditBoardOpen}
          board={board}
          onSubmit={editBoard}
        />
      )}

      <AddCardSheet
        open={Boolean(selectedCard)}
        onOpenChange={(open) => {
          if (!open) setSelectedCardId(null);
        }}
        card={selectedCard}
        listTitle={selectedCardList?.title ?? ''}
        members={members}
        isSubmitting={isUpdatingCard}
        onSubmit={(card, patch) => saveCard(card, patch)}
      />

      <MembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        members={members}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onInvite={inviteMember}
        onChangeRole={changeMemberRole}
        onRemove={removeMember}
      />

      <ActivitySheet
        open={activityOpen}
        onOpenChange={setActivityOpen}
        activities={activities}
        hasNextPage={Boolean(hasMoreActivity)}
        isLoading={isLoadingActivity}
        isLoadingMore={isFetchingActivity && activityPage > 1}
        onLoadMore={loadMoreActivity}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteDialog)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteDialog(null);
        }}
        title={deleteDialog?.title}
        description={deleteDialog?.description}
        itemName={deleteDialog?.itemName}
        details={deleteDialog?.details}
        onConfirm={async () => {
          if (!deleteDialog?.onConfirm || isDeleting) return;

          setIsDeleting(true);
          try {
            await deleteDialog.onConfirm();
          } finally {
            setIsDeleting(false);
          }
        }}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default BoardOverlays;
