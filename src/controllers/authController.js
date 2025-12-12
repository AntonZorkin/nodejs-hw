import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      next(createHttpError(400, 'Email in use'));
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    const newSession = await createSession(newUser._id);
    setSessionCookies(res, newSession);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      next(createHttpError(401, 'Invalid credentials'));
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      next(createHttpError(401, 'Invalid credentials'));
      return;
    }

    await Session.deleteOne({ userId: user._id });

    const newSession = await createSession(user._id);
    setSessionCookies(res, newSession);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken,
    });

    if (!session) {
      next(createHttpError(401, 'Session not found'));
      return;
    }

    if (session.refreshTokenValidUntil < new Date()) {
      next(createHttpError(401, 'Session token expired'));
      return;
    }

    await Session.deleteOne({
      _id: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken,
    });

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);
    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};
