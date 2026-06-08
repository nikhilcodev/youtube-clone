/**
 * Validation utilities for user input
 * Provides reusable validators for username, email, and password
 */

/**
 * Validate username
 * Requirements: 3-20 characters, alphanumeric + underscore/hyphen
 *
 * @param {string} username - Username to validate
 * @returns {object} { isValid: boolean, error: string|null }
 */
const validateUsername = (username) => {
    if (!username || typeof username !== "string") {
        return {
            isValid: false,
            error: "Username is required and must be a string",
        }
    }

    const trimmed = username.trim()

	if (trimmed.length < 3) {
		return {
			isValid: false,
			error: "Username must be at least 3 characters long.",
		}
	}

	if (trimmed.length > 20) {
		return {
			isValid: false,
			error: "Username must not exceed 20 characters.",
		}
	}

	// Allow only alphanumeric, underscore, and hyphen
	const usernameRegex = /^[a-zA-Z0-9_-]+$/
	if (!usernameRegex.test(trimmed)) {
		return {
			isValid: false,
			error:
				"Username can only contain letters, numbers, underscores, and hyphens.",
		}
	}

	return { isValid: true, error: null }
}

/**
 * Validate email format
 * Requirements: Valid email format
 *
 * @param {string} email - Email to validate
 * @returns {object} { isValid: boolean, error: string|null }
 */
const validateEmail = (email) => {
	if (!email || typeof email !== "string") {
		return {
			isValid: false,
			error: "Email is required and must be a string.",
		}
	}

	const trimmed = email.trim().toLowerCase()

	// RFC 5322 simplified email regex
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(trimmed)) {
		return {
			isValid: false,
			error: "Please provide a valid email address.",
		}
	}

	// Additional checks
	if (trimmed.length > 254) {
		return {
			isValid: false,
			error: "Email is too long.",
		}
	}

	const [localPart] = trimmed.split("@")
	if (localPart.length > 64) {
		return {
			isValid: false,
			error: "Email local part (before @) is too long.",
		}
	}

	return { isValid: true, error: null }
}

/**
 * Validate password strength
 * Requirements: Minimum 6 characters
 * Optional: Can enforce stronger requirements
 *
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {object} { isValid: boolean, error: string|null }
 */
const validatePassword = (password, options = {}) => {
	const {
		minLength = 6,
		requireUppercase = false,
		requireNumbers = false,
		requireSpecialChars = false,
	} = options

	if (!password || typeof password !== "string") {
		return {
			isValid: false,
			error: "Password is required and must be a string.",
		}
	}

	if (password.length < minLength) {
		return {
			isValid: false,
			error: `Password must be at least ${minLength} characters long.`,
		}
	}

	if (password.length > 128) {
		return {
			isValid: false,
			error: "Password is too long.",
		}
	}

	if (requireUppercase && !/[A-Z]/.test(password)) {
		return {
			isValid: false,
			error: "Password must contain at least one uppercase letter.",
		}
	}

	if (requireNumbers && !/[0-9]/.test(password)) {
		return {
			isValid: false,
			error: "Password must contain at least one number.",
		}
	}

	if (
		requireSpecialChars &&
		!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
	) {
		return {
			isValid: false,
			error: "Password must contain at least one special character.",
		}
	}

	return { isValid: true, error: null }
}

/**
 * Validate registration input
 * Validates all fields together for registration
 *
 * @param {object} data - { username, email, password }
 * @param {object} options - Validation options
 * @returns {object} { isValid: boolean, errors: object }
 */
const validateRegistration = (data, options = {}) => {
	const errors = {}

	// Validate username
	const usernameValidation = validateUsername(data.username)
	if (!usernameValidation.isValid) {
		errors.username = usernameValidation.error
	}

	// Validate email
	const emailValidation = validateEmail(data.email)
	if (!emailValidation.isValid) {
		errors.email = emailValidation.error
	}

	// Validate password
	const passwordValidation = validatePassword(data.password, options)
	if (!passwordValidation.isValid) {
		errors.password = passwordValidation.error
	}

	const isValid = Object.keys(errors).length === 0

	return { isValid, errors }
}

/**
 * Validate login input
 * Validates email and password for login
 *
 * @param {object} data - { email, password }
 * @returns {object} { isValid: boolean, errors: object }
 */
const validateLogin = (data) => {
	const errors = {}

	// Validate email
	const emailValidation = validateEmail(data.email)
	if (!emailValidation.isValid) {
		errors.email = emailValidation.error
	}

	// Validate password (basic check - no length enforcement for login)
	if (!data.password || typeof data.password !== "string") {
		errors.password = "Password is required."
	}

	const isValid = Object.keys(errors).length === 0

	return { isValid, errors }
}

/**
 * Validate video creation input
 *
 * @param {object} data - Video data
 * @returns {object} { isValid: boolean, errors: object }
 */
const validateVideo = (data) => {
	const errors = {}

	// Validate title
	if (!data.title || typeof data.title !== "string") {
		errors.title = "Video title is required and must be a string."
	} else if (data.title.trim().length < 3) {
		errors.title = "Video title must be at least 3 characters long."
	} else if (data.title.trim().length > 200) {
		errors.title = "Video title must not exceed 200 characters."
	}

	// Validate description (optional but check if provided)
	if (data.description && typeof data.description !== "string") {
		errors.description = "Description must be a string."
	} else if (data.description && data.description.trim().length > 5000) {
		errors.description = "Description must not exceed 5000 characters."
	}

	// Validate videoUrl
	if (!data.videoUrl || typeof data.videoUrl !== "string") {
		errors.videoUrl = "Video URL is required and must be a string."
	} else if (!isValidUrl(data.videoUrl)) {
		errors.videoUrl = "Video URL must be a valid URL."
	}

	// Validate thumbnailUrl
	if (!data.thumbnailUrl || typeof data.thumbnailUrl !== "string") {
		errors.thumbnailUrl = "Thumbnail URL is required and must be a string."
	} else if (!isValidUrl(data.thumbnailUrl)) {
		errors.thumbnailUrl = "Thumbnail URL must be a valid URL."
	}

	// Validate channelId
	if (!data.channelId || typeof data.channelId !== "string") {
		errors.channelId = "Channel ID is required and must be a string."
	} else if (!data.channelId.trim()) {
		errors.channelId = "Channel ID is required."
	}

	// Validate category
	const validCategories = [
		"Music",
		"Gaming",
		"Education",
		"Entertainment",
		"Sports",
		"Tech",
		"Other",
	]
	if (data.category && !validCategories.includes(data.category)) {
		errors.category = `Category must be one of: ${validCategories.join(", ")}`
	}

	const isValid = Object.keys(errors).length === 0

	return { isValid, errors }
}

/**
 * Validate channel creation/update input
 *
 * @param {object} data - Channel data
 * @returns {object} { isValid: boolean, errors: object }
 */
const validateChannel = (data) => {
	const errors = {}

	if (!data.channelName || typeof data.channelName !== "string") {
		errors.channelName = "Channel name is required and must be a string."
	} else if (data.channelName.trim().length < 3) {
		errors.channelName = "Channel name must be at least 3 characters long."
	} else if (data.channelName.trim().length > 100) {
		errors.channelName = "Channel name must not exceed 100 characters."
	}

	if (data.description && typeof data.description !== "string") {
		errors.description = "Description must be a string."
	} else if (data.description && data.description.trim().length > 5000) {
		errors.description = "Description must not exceed 5000 characters."
	}

	if (data.channelBanner && typeof data.channelBanner !== "string") {
		errors.channelBanner = "Channel banner must be a string."
	} else if (data.channelBanner && !isValidUrl(data.channelBanner)) {
		errors.channelBanner = "Channel banner must be a valid URL."
	}

	const isValid = Object.keys(errors).length === 0

	return { isValid, errors }
}

/**
 * Helper function to validate URL format
 *
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
const isValidUrl = (url) => {
	try {
		new URL(url)
		return true
	} catch (error) {
		return false
	}
}

export {
    validateUsername,
    validateEmail,
    validatePassword,
    validateRegistration,
    validateLogin,
    validateVideo,
    validateChannel,
}