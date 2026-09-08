// client/src/components/EditBel.jsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from '../AuthContext.jsx';


function EditBel({ bel, updateBelLocal }) {
  const { user } = useAuth();
  const [description, setDescription] = useState(bel.description);
  const [isModal, setIsModal] = useState(false);

  function closeModal() {
    setDescription(bel.description);
    setIsModal(false);
  }
  async function updateDescription(e) {
    e.preventDefault();
    try {
      const body = { description: description };
      await axios.put(`http://localhost:5000/bels/${bel.bel_id}?user_id=${user.user_id}`, body);
      setIsModal(false);
      updateBelLocal(bel.bel_id, description);

    } catch (error) {
      console.error(error.message);
    }
  }
  return (
    <>
      <button type="button" className="edit-btn" title="промени" onClick={() => setIsModal(true)}>Промени</button>
      {isModal && (
        <div className="modal-overlay"
          onClick={closeModal}
          onKeyDown={e => e.key === "Escape" && closeModal()}
          tabIndex={0}
        >
          <div className="modal-frm" onClick={e => e.stopPropagation()}>
            <button type="button" className="modal-x-btn" onClick={closeModal}>&times;</button>
            <h2>Edit text</h2>
            <form onSubmit={updateDescription}>
              <input autoFocus className="input input-modal" name="edit-descr" value={description} onChange={e => setDescription(e.target.value)} type="text" />
              <div className="modal-btns">
                <button type="submit" className="edit-btn">Save</button>
                <button type="button" className="del-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )
      }
    </>
  );
}
export default EditBel