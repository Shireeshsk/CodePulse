export const Logout = async (req, res) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh'
    });

    return res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};
