import UserPreference from '../models/UserPreference.js';
import { validationResult } from 'express-validator';

export const setPreference = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, preference_value } = req.body;

    const preference = await UserPreference.findOneAndUpdate(
      { user_id: req.user.id, category },
      { 
        $set: { preference_value },
        $setOnInsert: { user_id: req.user.id, category }
      },
      { new: true, upsert: true }
    );

    res.json(preference);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { user_id: req.user.id };
    if (category) {
      query.category = category;
    }

    const preferences = await UserPreference.find(query);
    
    // Transform to key-value format if requested
    const format = req.query.format || 'array';
    if (format === 'object') {
      const preferencesObject = preferences.reduce((acc, pref) => {
        acc[pref.category] = pref.preference_value;
        return acc;
      }, {});
      return res.json(preferencesObject);
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deletePreference = async (req, res) => {
  try {
    const { category } = req.params;

    const preference = await UserPreference.findOneAndDelete({
      user_id: req.user.id,
      category
    });

    if (!preference) {
      return res.status(404).json({ message: 'Preference not found' });
    }

    res.json({ message: 'Preference deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bulkSetPreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: 'Preferences must be an array' });
    }

    const operations = preferences.map(pref => ({
      updateOne: {
        filter: { user_id: req.user.id, category: pref.category },
        update: { 
          $set: { preference_value: pref.preference_value },
          $setOnInsert: { user_id: req.user.id, category: pref.category }
        },
        upsert: true
      }
    }));

    await UserPreference.bulkWrite(operations);

    const updatedPreferences = await UserPreference.find({
      user_id: req.user.id,
      category: { $in: preferences.map(p => p.category) }
    });

    res.json(updatedPreferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPreferences = async (req, res) => {
  try {
    await UserPreference.deleteMany({ user_id: req.user.id });
    res.json({ message: 'All preferences reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 