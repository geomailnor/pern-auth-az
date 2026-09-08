import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  // 1. Вземаме токена от header-а
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нямате достъп. Липсва токен.' });
  }

  // 2. Извличаме самия токен (без "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Проверяваме дали токенът е валиден
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    // Този ред ще се изпълни САМО ако токенът е валиден
    // 4. Добавяме потребителя към req обекта
    req.user = decoded;

    // 5. Продължаваме към следващия маршрут
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Сесията е изтекла. Влезте отново.' });
    }
    return res.status(401).json({ message: 'Невалиден токен.' });
  }
};