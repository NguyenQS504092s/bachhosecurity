/**
 * Google Sheets Service
 * Reads timesheet data from Google Sheets
 * Supports API mode (with key) and CSV export mode (public sheets)
 */

// Sheet configuration
const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '174JidXU87O9QZnkD0qfwvYimPpj8STIqIJgzVDyPQkM'
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
// GID is the tab ID in Google Sheets (from URL gid=xxx)
const SHEETS_GID = import.meta.env.VITE_GOOGLE_SHEETS_GID || '1964190322'

// Sheet row structure from spreadsheet
export interface SheetRow {
  rowIndex: number
  employeeCode: string
  employeeName: string
  department: string
  shift: string
  attendance: Record<number, string> // day -> value
  lastModified?: string
}

// Sheet metadata
export interface SheetMetadata {
  title: string
  headers: string[]
  rowCount: number
  lastUpdated?: string
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
  return !!(SHEETS_ID && API_KEY)
}

/**
 * Read sheet data via CSV export (no API key needed)
 */
async function readSheetDataViaCsv(): Promise<SheetRow[]> {
  if (!SHEETS_ID) {
    throw new Error('Missing VITE_GOOGLE_SHEETS_ID in .env')
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/export?format=csv&gid=${SHEETS_GID}`

  try {
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Cannot access sheet. Status: ${response.status}. Make sure the sheet is shared via link.`)
    }

    const csvText = await response.text()
    const rows = parseCsv(csvText)

    return rows.slice(1)
      .map((row, index) => parseSheetRow(row, index + 2))
      .filter(row => row.employeeCode || row.employeeName)
  } catch (error) {
    console.error('Failed to read sheet via CSV:', error)
    throw error
  }
}

/**
 * Simple CSV parser
 */
function parseCsv(csvText: string): string[][] {
  const lines = csvText.split('\n')
  const rows: string[][] = []

  for (const line of lines) {
    if (!line.trim()) continue

    const row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    row.push(current.trim())
    rows.push(row)
  }

  return rows
}

/**
 * Read sheet data via Sheets API
 */
async function readSheetDataViaApi(range: string): Promise<SheetRow[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.error?.message || `Sheets API error: ${response.status}`
    )
  }

  const data = await response.json()
  const rows: string[][] = data.values || []

  return rows
    .map((row, index) => parseSheetRow(row, index + 2))
    .filter(row => row.employeeCode || row.employeeName)
}

/**
 * Read all employee rows from Google Sheet
 * Auto-selects method based on available config
 */
export async function readSheetData(
  range: string = 'Sheet1!A2:AG100'
): Promise<SheetRow[]> {
  if (!SHEETS_ID) {
    throw new Error('Missing VITE_GOOGLE_SHEETS_ID in .env')
  }

  try {
    if (hasApiKey()) {
      return await readSheetDataViaApi(range)
    } else {
      console.log('No API key configured, using CSV export method')
      return await readSheetDataViaCsv()
    }
  } catch (error) {
    console.error('Failed to read sheet:', error)
    throw error
  }
}

/**
 * Parse a raw sheet row into structured data
 */
function parseSheetRow(row: string[], rowIndex: number): SheetRow {
  const [code, name, department, shift, ...rest] = row

  const attendance: Record<number, string> = {}
  for (let i = 0; i < 31 && i < rest.length; i++) {
    const value = rest[i]?.trim()
    if (value) {
      attendance[i + 1] = value
    }
  }

  const lastModified = rest.length > 31 ? rest[31] : undefined

  return {
    rowIndex,
    employeeCode: code?.trim() || '',
    employeeName: name?.trim() || '',
    department: department?.trim() || '',
    shift: shift?.trim() || '',
    attendance,
    lastModified
  }
}

/**
 * Get sheet metadata
 */
export async function getSheetMetadata(): Promise<SheetMetadata> {
  if (!SHEETS_ID || !API_KEY) {
    throw new Error('Missing Google Sheets config')
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}?key=${API_KEY}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Sheets API error: ${response.status}`)
    }

    const data = await response.json()
    const sheet = data.sheets?.[0]
    const title = sheet?.properties?.title || 'Sheet1'
    const rowCount = sheet?.properties?.gridProperties?.rowCount || 0

    const headersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(`${title}!A1:AG1`)}?key=${API_KEY}`
    const headersResponse = await fetch(headersUrl)
    const headersData = await headersResponse.json()
    const headers = headersData.values?.[0] || []

    return { title, headers, rowCount }
  } catch (error) {
    console.error('Failed to get sheet metadata:', error)
    throw error
  }
}

/**
 * Convert Sheet row to Employee format
 */
export function sheetRowToEmployee(row: SheetRow): {
  code: string
  name: string
  department: string
  shift: string
  attendance: Record<number, string>
} {
  return {
    code: row.employeeCode,
    name: row.employeeName,
    department: row.department,
    shift: row.shift,
    attendance: row.attendance
  }
}

/**
 * Test connection
 */
export async function testSheetsConnection(): Promise<{
  success: boolean
  message: string
  metadata?: SheetMetadata
}> {
  if (!SHEETS_ID) {
    return {
      success: false,
      message: 'Thiếu VITE_GOOGLE_SHEETS_ID trong .env'
    }
  }

  if (hasApiKey()) {
    try {
      const metadata = await getSheetMetadata()
      return {
        success: true,
        message: `Connected via API: ${metadata.title} (${metadata.rowCount} rows)`,
        metadata
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect'
      }
    }
  }

  return {
    success: true,
    message: 'Ready to sync via CSV export'
  }
}
