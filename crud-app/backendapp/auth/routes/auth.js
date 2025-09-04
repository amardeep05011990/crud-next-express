const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { hashPassword, verifyPassword, signAccess, signRefresh, verifyRefresh } = require('../lib/auth');
const jwt = require('jsonwebtoken');
const  authenticate = require('./../middleware/authenticate')
const  authorize = require('./../middleware/authorize')

router.get("/health", (req,res)=>{
    return  res.status(200).json({messege: "ok"})
})
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *               role:
 *                 type: string
 *                 example: user
 *               orgId:
 *                 type: string
 *                 example: 64fc92aa09eacb1234567890
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or email already exists
 */
router.post('/register', async (req, res) => {
  const { email, password, role, orgId } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });
  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash, role: role || 'user', orgId });
  return res.status(201).json({ id: user._id, email: user.email });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const access = signAccess({ sub: user._id.toString(), role: user.role, orgId: user.orgId });
  const refresh = signRefresh({ sub: user._id.toString(), role: user.role, orgId: user.orgId });

  // Save refresh token id in user for rotation and revocation
  user.refreshTokenId = refresh.tid;
  await user.save();

  // Set refresh token as httpOnly cookie for security
  res.cookie('refreshToken', refresh.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 1 // 7d
  });

  return res.json({ accessToken: access });
});

// login route
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//   const valid = await verifyPassword(password, user.passwordHash);
//   if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

//   const accessToken = signAccess({ sub: user._id, role: user.role, orgId: user.orgId });

//   const { token: refreshToken, tid } = signRefresh({ sub: user._id, role: user.role, orgId: user.orgId });
//   user.refreshTokenId = tid;              // 🔹 Save tid to DB
//   await user.save();

//   res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax" });
//   res.json({ accessToken });
// });


/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns new access token
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', async (req, res) => {
  const token = req?.cookies?.refreshToken;
  console.log("refresh token", token)
  if (!token) return res.status(401).json({ message: 'Missing refresh token' });
  try {
    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    console.log("user======>>>>>>>>>>", user)
    if (!user) throw new Error('No user');
    // token revocation: check tid
    if (!user.refreshTokenId || user.refreshTokenId !== payload.tid) {
              console.log("Mismatch tid", user.refreshTokenId, payload.tid);
      return res.status(401).json({ message: 'Refresh token revoked' });
    }
    // rotate
    const access = signAccess({ sub: user._id.toString(), role: user.role, orgId: user.orgId });
    const refresh = signRefresh({ sub: user._id.toString(), role: user.role, orgId: user.orgId });
    user.refreshTokenId = refresh.tid;
    console.log("refreshTokenId======>>>>>>>>>>", refresh.tid)

    await user.save();
    res.cookie('refreshToken', refresh.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.json({ accessToken: access });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// refresh route
// router.post('/refresh', async (req, res) => {
//   const token = req.cookies.refreshToken;
//   console.log("refressh token", token)
//   if (!token) return res.status(401).json({ message: 'Missing refresh token' });

//   try {
//     const payload = verifyRefresh(token);

//     const user = await User.findById(payload.sub);
//     if (!user || user.refreshTokenId !== payload.tid) {
//         console.log("miss matched --", user.refreshTokenId, payload.tid)
//       return res.status(401).json({ message: 'Refresh token revoked' });
//     }

//     // ✅ Generate new pair
//     const accessToken = signAccess({ sub: user._id, role: user.role, orgId: user.orgId });
//     const { token: newRefreshToken, tid: newTid } = signRefresh({ sub: user._id, role: user.role, orgId: user.orgId });

//     user.refreshTokenId = newTid;   // 🔹 Overwrite DB with the new tid
//     await user.save();

//     res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite: "lax" });
//     res.json({ accessToken });
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ message: 'Invalid refresh token' });
//   }
// });

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', async (req, res) => {
  // clear cookie and revoke refresh token in DB
  const token = req?.cookies?.refreshToken;
  if (token) {
    try {
      const payload = verifyRefresh(token);
      const user = await User.findById(payload.sub);
      if (user) { 
        user.refreshTokenId = null; 
        await user.save(); 
    }
    } catch (e) { /* ignore */ }
  }
  // res.clearCookie('refreshToken');
  res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  return res.json({ ok: true });
});

// router.post('/logout', async (req, res) => {
//   const token = req.cookies?.refreshToken;
//   if (token) {
//     try {
//       const payload = verifyRefresh(token);
//       const updateddata = await User.findByIdAndUpdate(payload.sub, { refreshTokenId: null }); // ✅ direct update
//       console.log("updated data", updateddata)
//     } catch (e) {
//       console.error("Logout error:", e.message);
//     }
//   }

// //   res.clearCookie("refreshToken");
// // res.clearCookie("refreshToken", {
// //   httpOnly: true,
// //   secure: process.env.NODE_ENV === "production",
// //   sameSite: "strict",
// // //   path: "/",   // must match
// // });
//   res.clearCookie("refreshToken", { httpOnly: true, sameSite: "lax" });
// console.log("res  cookies", res?.cookies?.refreshToken)

//   return res.json({ ok: true });
// });


/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.user is already set by authenticate()
    // strip sensitive fields
    const { passwordHash, refreshTokenId, ...safeUser } = req.user;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
