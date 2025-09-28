const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, contraseña y nombre son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        error: 'El nombre debe tener entre 2 y 50 caracteres'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Ya existe una cuenta con este email'
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim()
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Ya existe una cuenta con este email'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Cuenta desactivada. Contacta al administrador.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = req.user;

    // Update allowed fields
    if (name !== undefined) {
      if (name.length < 2 || name.length > 50) {
        return res.status(400).json({
          error: 'El nombre debe tener entre 2 y 50 caracteres'
        });
      }
      user.name = name.trim();
    }

    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/auth/change-password - Change user password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/verify-token - Verify if token is valid
router.post('/verify-token', authenticate, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/auth/account - Delete user account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password before deletion
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Contraseña incorrecta'
      });
    }

    // Delete user (this will cascade delete related data if configured)
    await User.findByIdAndDelete(req.user._id);

    res.json({
      message: 'Cuenta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
