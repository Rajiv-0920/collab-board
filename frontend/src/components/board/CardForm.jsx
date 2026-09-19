const CardForm = ({
  handleSubmit,
  cardBody,
  setCardBody,
  isLoading,
  isUpdate,
}) => {
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          onChange={(e) => setCardBody({ ...cardBody, title: e.target.value })}
          value={cardBody.title}
          placeholder="Card title"
        />
        <button type="submit" disabled={isLoading}>
          {isUpdate ? 'Update Card' : 'Add Card'}
        </button>
      </form>
    </>
  );
};

export default CardForm;
