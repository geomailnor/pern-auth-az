// client/src/components/ListBel.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import EditBel from "./EditBel.jsx";
import { useAuth } from '../AuthContext.jsx';
import { useLocation } from "react-router-dom";
import { API_URL } from '../config';

function ListBels() {
  const location = useLocation();
  const { user } = useAuth();
  const [bels, setBels] = useState([]);

  async function deleteTodo(id) {
    try {
      await axios.delete(`${API_URL}/bels/${id}?user_id=${user.user_id}`);
      setBels(bels.filter(bel => bel.bel_id !== id));
    } catch (error) {
      console.error(error.message);
    }
  }

  function updateBelLocal(id, newDescrip) {
    setBels(bels.map(bel => bel.bel_id === id ? { ...bel, description: newDescrip } : bel));
  }
  useEffect(() => {
    async function getTodo() {
      try {
        const response = await axios.get(`${API_URL}/bels?user_id=${user.user_id}`);
        setBels(response.data);
      } catch (error) {
        console.error(error.message);
      }
    }
    getTodo();
  }, [user.user_id, location.key]);
  return (
    <div className="todo-list">
      <div className="todo-header">
        <div>Текст на бележката</div>
        <div>Редакция</div>
        <div>Изтриване</div>
      </div>
      {bels.map(bel =>
        <div className="todo-row" key={bel.bel_id}>
          <div>{bel.description}</div>
          <div><EditBel bel={bel} updateBelLocal={updateBelLocal} /></div>
          <button type="button" className="del-btn" title="изтрива записа" onClick={() => deleteTodo(bel.bel_id)}>Изтрий</button>
        </div>
      )}
    </div>
  );
}
export default ListBels;