import { useState } from "react";
import axios from "axios";
import { useAuth } from '../AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function InputBel() {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [description, setDescription] = useState('');

  async function onSubmitForm(e) {
    e.preventDefault();
    if (!description.trim()) { return }

    try {
      const body = { description: description, user_id: user.user_id }
      await axios.post('http://localhost:5000/bels', body);

      setDescription(''); // ← Изчиства полето
      navigate('/tasks');
    } catch (error) {
      console.error(error.message);
    }
  }
  return (
    <>
      <h1>Моите Бележки</h1>
      <form className="input-bel-frm" onSubmit={onSubmitForm}>
        <input name="input-txt" className="input" value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder="текст на задачата" />
        <button type="submit" title="запазва новата бел." className="input-btn">Добави</button>
      </form>
    </>
  );
}
export default InputBel;