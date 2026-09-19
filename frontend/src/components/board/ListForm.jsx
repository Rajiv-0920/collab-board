const ListForm = ({
  listBody,
  setListBody,
  handleSubmit,
  isUpdating,
  isLoadingCreateList,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={(e) => setListBody({ ...listBody, title: e.target.value })}
        value={listBody.title}
        name="title"
        placeholder="List title"
      />
      <button type="submit" disabled={isLoadingCreateList}>
        {isUpdating ? 'Updating...' : 'Add List'}
      </button>
    </form>
  );
};

export default ListForm;
