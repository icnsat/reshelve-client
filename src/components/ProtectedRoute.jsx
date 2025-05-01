import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Если не авторизован - отправляем на страницу логина
    return <Navigate to="/login" replace />;
  }

  // if (!allowedRoles.includes(user.role)) {
  //   // Если роль не разрешена - редирект на главную страницу
  //   return <Navigate to="/" replace />;
  // }

  // Иначе отдаем дочерние элементы
  return children;
};

export default ProtectedRoute;
