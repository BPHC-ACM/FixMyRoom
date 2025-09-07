import { createClient } from '@supabase/supabase-js'

// Types and interfaces for the admin access system
import type { SupabaseClient } from '@supabase/supabase-js'
export interface Admin {
    id: number
    created_at: string
    name: string
    email_id: string
    admin_type: string
    hostel_name: string
    female_hostel: boolean
}

export interface MaintenanceRequest {
    id: string
    created_at: string
    email: string
    phone: string
    building: string
    roomNo: string
    category: string
    problem: string
    visitTime: "morning" | "afternoon" | "evening" | "any"
    termsCheck: boolean
    priority: "low" | "medium" | "high"
    name: string
    status: "pending" | "in-progress" | "completed"
    isDeleted: boolean
    studentId?: string
    comments?: {
        id: string
        text: string
        from: "admin" | "user"
        timestamp: string
    }[]
    hasImage?: boolean
    image_url?: string
}

/**
 * Get admin details for the current logged-in user
 */
export async function getCurrentAdminDetails(supabase: SupabaseClient, userEmail: string): Promise<Admin | null> {
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
 * Check if a hostel is a female hostel by querying the database
 */
export async function isFemaleHostelDB(supabase: any, hostelName: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('admins')
        .select('female_hostel')
        .eq('hostel_name', hostelName)
        .limit(1)
        .single()

    if (error || !data) {
        console.error('Error checking if hostel is female:', error)
        return false
    }

    return data.female_hostel
}

/**
 * Check if admin can access requests from a specific hostel
 */
export async function canAdminAccessHostel(
    supabase: any,
    admin: Admin,
    hostelName: string
): Promise<boolean> {
    // Get the female_hostel status for the target hostel
    const isTargetFemaleHostel = await isFemaleHostelDB(supabase, hostelName)

    // If it's a female hostel, admin must be assigned to a female hostel
    if (isTargetFemaleHostel) {
        return admin.female_hostel
    }

    // For male hostels, admin must NOT be assigned to a female hostel
    return !admin.female_hostel
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
    const filteredRequests = []
    for (const request of allRequests) {
        const canAccess = await canAdminAccessHostel(supabase, admin, request.building)
        if (canAccess) {
            filteredRequests.push(request)
        }
    }

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
 * Check if a hostel is a female hostel using database lookup
 */
export async function isFemaleHostel(supabase: any, hostelName: string): Promise<boolean> {
    return await isFemaleHostelDB(supabase, normalizeHostelName(hostelName))
}

/**
 * Get hostel access summary for admin
 */
export async function getAdminHostelAccess(
    supabase: any,
    admin: Admin
): Promise<{
    canAccessFemaleHostels: boolean
    canAccessMaleHostels: boolean
    assignedHostel: string
    accessibleHostels: string[]
}> {
    const canAccessFemale = admin.female_hostel

    // Get list of accessible hostels from database
    let accessibleHostels: string[] = []
    if (canAccessFemale) {
        // Get all female hostels
        const { data: femaleHostels, error } = await supabase
            .from('admins')
            .select('hostel_name')
            .eq('female_hostel', true)

        if (!error && femaleHostels) {
            accessibleHostels = [...new Set(femaleHostels.map((h: { hostel_name: string }) => h.hostel_name).filter(Boolean))] as string[]
        }
    } else {
        // Get all male hostels
        const { data: maleHostels, error } = await supabase
            .from('admins')
            .select('hostel_name')
            .eq('female_hostel', false)

        if (!error && maleHostels) {
            accessibleHostels = [...new Set(maleHostels.map((h: { hostel_name: string }) => h.hostel_name).filter(Boolean))] as string[]
        }
    }

    return {
        canAccessFemaleHostels: canAccessFemale,
        canAccessMaleHostels: !canAccessFemale,
        assignedHostel: admin.hostel_name,
        accessibleHostels
    }
}
