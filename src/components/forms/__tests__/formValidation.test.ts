// 基本表单验证测试
// 这个文件专注于测试表单验证逻辑，不依赖复杂的测试库

import {
  validationHelpers,
  formatters,
  fieldValidators
} from '../../../lib/formValidation'

// 简单的测试框架
const test = (name: string, fn: () => void) => {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`)
  }
}

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, but got ${actual}`)
    }
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`)
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy value, but got ${actual}`)
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected falsy value, but got ${actual}`)
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected null, but got ${actual}`)
    }
  },
  toBeLessThanOrEqual: (expected: number) => {
    if (actual > expected) {
      throw new Error(`Expected ${actual} to be less than or equal to ${expected}`)
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`)
    }
  },
  toContain: (expected: any) => {
    if (!actual.includes(expected)) {
      throw new Error(`Expected ${actual} to contain ${expected}`)
    }
  }
})

// 运行测试
console.log('🧪 开始表单验证测试...\n')

// 邮箱验证测试
test('validationHelpers.isValidEmail - 有效邮箱', () => {
  expect(validationHelpers.isValidEmail('test@example.com')).toBeTruthy()
  expect(validationHelpers.isValidEmail('user.name+tag@domain.co.uk')).toBeTruthy()
})

test('validationHelpers.isValidEmail - 无效邮箱', () => {
  expect(validationHelpers.isValidEmail('')).toBeFalsy()
  expect(validationHelpers.isValidEmail('invalid-email')).toBeFalsy()
  expect(validationHelpers.isValidEmail('@domain.com')).toBeFalsy()
  expect(validationHelpers.isValidEmail('user@')).toBeFalsy()
})

// 电话号码验证测试
test('validationHelpers.isValidPhone - 有效电话号码', () => {
  expect(validationHelpers.isValidPhone('13800138000')).toBeTruthy()
  expect(validationHelpers.isValidPhone('18612345678')).toBeTruthy()
  expect(validationHelpers.isValidPhone('+8613800138000')).toBeTruthy()
})

test('validationHelpers.isValidPhone - 无效电话号码', () => {
  expect(validationHelpers.isValidPhone('')).toBeFalsy()
  expect(validationHelpers.isValidPhone('123456')).toBeFalsy()
  expect(validationHelpers.isValidPhone('abcdefghijk')).toBeFalsy()
})

// 邮政编码验证测试
test('validationHelpers.isValidPostalCode - 有效邮政编码', () => {
  expect(validationHelpers.isValidPostalCode('100000', 'CN')).toBeTruthy()
  expect(validationHelpers.isValidPostalCode('200001', 'CN')).toBeTruthy()
})

test('validationHelpers.isValidPostalCode - 无效邮政编码', () => {
  expect(validationHelpers.isValidPostalCode('', 'CN')).toBeFalsy()
  expect(validationHelpers.isValidPostalCode('12345', 'CN')).toBeFalsy()
  expect(validationHelpers.isValidPostalCode('1234567', 'CN')).toBeFalsy()
  expect(validationHelpers.isValidPostalCode('abcdef', 'CN')).toBeFalsy()
})

// 密码强度测试
test('validationHelpers.getPasswordStrength', () => {
  const weakPassword = validationHelpers.getPasswordStrength('123')
  expect(weakPassword.level).toEqual('weak')
  expect(weakPassword.score).toBeLessThanOrEqual(2)

  const strongPassword = validationHelpers.getPasswordStrength('Password123!')
  expect(strongPassword.level).toEqual('strong')
  expect(strongPassword.score).toBeGreaterThan(4)
})

// 字段验证器测试
test('fieldValidators.required', () => {
  expect(fieldValidators.required('', '测试字段')).toEqual('测试字段不能为空')
  expect(fieldValidators.required('   ', '测试字段')).toEqual('测试字段不能为空')
  expect(fieldValidators.required('有效值', '测试字段')).toBeNull()
})

test('fieldValidators.minLength', () => {
  expect(fieldValidators.minLength('abc', 5, '测试字段')).toEqual('测试字段至少需要5个字符')
  expect(fieldValidators.minLength('abcdef', 5, '测试字段')).toBeNull()
})

test('fieldValidators.maxLength', () => {
  expect(fieldValidators.maxLength('abcdef', 5, '测试字段')).toEqual('测试字段不能超过5个字符')
  expect(fieldValidators.maxLength('abc', 5, '测试字段')).toBeNull()
})

test('fieldValidators.pattern', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  expect(fieldValidators.pattern('invalid-email', emailRegex, '邮箱格式不正确')).toEqual('邮箱格式不正确')
  expect(fieldValidators.pattern('test@example.com', emailRegex, '邮箱格式不正确')).toBeNull()
})

// 格式化器测试
test('formatters.number', () => {
  expect(formatters.number('123.45abc')).toEqual('123.45')
  expect(formatters.number('abc123')).toEqual('123')
  expect(formatters.number('')).toEqual('')
})

test('formatters.phone', () => {
  expect(formatters.phone('138-0013-8000')).toEqual('138-0013-8000')
  expect(formatters.phone('13800138000')).toEqual('13800138000')
  expect(formatters.phone('')).toEqual('')
})

test('formatters.email', () => {
  expect(formatters.email('Test@EXAMPLE.COM')).toEqual('test@example.com')
  expect(formatters.email('  test@example.com  ')).toEqual('test@example.com')
})

test('formatters.whitespace', () => {
  expect(formatters.whitespace('  多个   空格  ')).toEqual('多个 空格')
  expect(formatters.whitespace('')).toEqual('')
})

test('formatters.currency', () => {
  expect(formatters.currency(123.45)).toContain('123.45')
  expect(formatters.currency('123.45')).toContain('123.45')
  expect(formatters.currency(0)).toContain('0.00')
})

console.log('\n🎉 表单验证测试完成!')