import { createClient } from '@supabase/supabase-js'

// Type definitions
export interface Admin {
    id: number
    created_at: string
    name: string
    email_id: string
    admin_type: string
    hostel_name: string
}

export interface MaintenanceRequest {
    id: number
    created_at: string
    email: string
    phone: string
    building: string
    roomNo: string
    category: string
    problem: string
    visitTime: string
    termsCheck: boolean
    priority: string
    name: string
    status: string
    isDeleted: boolean
    studentId?: string
    comments?: string
    hasImage?: boolean
}

// Female hostels list
const FEMALE_HOSTELS = ['Malaivya Bhavan', 'Meera Bhavan', 'Ganga Bhavan']

/**
 * Get admin details for the current logged-in user
 */
export async function getCurrentAdminDetails(supabase: any, userEmail: string): Promise<Admin | null> {
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email_id', userEmail)
        .single()

    if (error) {
        console.error('Error fetching admin details:', error)
        return null
    }

    return data
}

/**
 * Check if admin can access requests from a specific hostel
 */
export function canAdminAccessHostel(admin: Admin, hostelName: string): boolean {
    // If it's a female hostel, admin must be assigned to a female hostel
    if (FEMALE_HOSTELS.includes(hostelName)) {
        return FEMALE_HOSTELS.includes(admin.hostel_name)
    }

    // For male hostels, admin must NOT be assigned to a female hostel
    return !FEMALE_HOSTELS.includes(admin.hostel_name)
}

/**
 * Get filtered maintenance requests based on admin's hostel access
 */
export async function getFilteredMaintenanceRequests(
    supabase: any,
    admin: Admin
): Promise<MaintenanceRequest[]> {

    // Get all maintenance requests
    const { data: allRequests, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching maintenance requests:', error)
        return []
    }

    // Filter requests based on admin's hostel access
    const filteredRequests = allRequests.filter((request: MaintenanceRequest) => {
        return canAdminAccessHostel(admin, request.building)
    })

    return filteredRequests
}

/**
 * Normalize hostel names for comparison (handles variations in naming)
 */
export function normalizeHostelName(hostelName: string): string {
    // Handle variations like "Malaivya Bhavan" vs "Malaviya Bhavan"
    const normalizedName = hostelName.toLowerCase().trim()

    if (normalizedName.includes('malaivya') || normalizedName.includes('malaviya')) {
        return 'Malaivya Bhavan'
    }
    if (normalizedName.includes('meera')) {
        return 'Meera Bhavan'
    }
    if (normalizedName.includes('ganga')) {
        return 'Ganga Bhavan'
    }

    return hostelName
}

/**
 * Check if a hostel is a female hostel
 */
export function isFemaleHostel(hostelName: string): boolean {
    const normalizedName = normalizeHostelName(hostelName)
    return FEMALE_HOSTELS.includes(normalizedName)
}

/**
 * Get hostel access summary for admin
 */
export function getAdminHostelAccess(admin: Admin): {
    canAccessFemaleHostels: boolean
    canAccessMaleHostels: boolean
    assignedHostel: string
    accessibleHostels: string[]
} {
    const canAccessFemale = FEMALE_HOSTELS.includes(admin.hostel_name)

    return {
        canAccessFemaleHostels: canAccessFemale,
        canAccessMaleHostels: !canAccessFemale,
        assignedHostel: admin.hostel_name,
        accessibleHostels: canAccessFemale ? FEMALE_HOSTELS : []
    }
}
