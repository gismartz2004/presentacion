exports.logout = (req, res) => {
  res.clearCookie('session', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });
  return res.status(200).json({
    status: "success",
    message: "Logout exitoso"
  });
};