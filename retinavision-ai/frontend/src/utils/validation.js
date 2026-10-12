/**
 * Clinical Form & File Validation
 */

export function validatePatientForm(data) {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Patient full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (data.age === undefined || data.age === null || data.age === '') {
    errors.age = 'Patient age is required.';
  } else {
    const ageNum = parseInt(data.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      errors.age = 'Please enter a valid age between 1 and 120.';
    }
  }

  if (data.phone && data.phone.trim()) {
    const phoneClean = data.phone.replace(/[\s\-\(\)\+]/g, '');
    if (phoneClean.length < 7 || phoneClean.length > 15) {
      errors.phone = 'Please enter a valid contact phone number.';
    }
  }

  if (data.visitDate) {
    const vDate = new Date(data.visitDate);
    if (isNaN(vDate.getTime())) {
      errors.visitDate = 'Invalid visit date format.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: 'No image file selected.' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = file.name.split('.').pop().toLowerCase();
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
    return {
      isValid: false,
      error: 'Unsupported file format. Please upload a high-resolution fundus photograph in JPG, JPEG, or PNG format.'
    };
  }

  const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds 25MB limit. Please upload a compressed clinical fundus scan.'
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'Uploaded image file is empty (0 bytes).' };
  }

  return { isValid: true, error: null };
}

