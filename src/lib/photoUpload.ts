import { supabase } from '../supabaseClient'

export interface PhotoUploadResult {
    success: boolean
    imageUrl?: string
    error?: string
}

/**
 * Upload a photo to Supabase Storage and return the public URL
 */
export async function uploadPhoto(file: File, requestId: string): Promise<PhotoUploadResult> {
    try {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            return { success: false, error: 'Please select a valid image file' }
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return { success: false, error: 'Image size must be less than 5MB' }
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${requestId}-${Date.now()}.${fileExt}`
        const filePath = `maintenance-photos/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('maintenance-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return { success: false, error: 'Failed to upload image' }
        }

        // Get public URL
        const { data } = supabase.storage
            .from('maintenance-images')
            .getPublicUrl(filePath)

        return {
            success: true,
            imageUrl: data.publicUrl
        }
    } catch (error) {
        console.error('Photo upload error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(imageUrl: string): Promise<boolean> {
    try {
        // Extract file path from URL
        const urlParts = imageUrl.split('/maintenance-images/')
        if (urlParts.length !== 2) {
            console.error('Invalid image URL format')
            return false
        }

        const filePath = `maintenance-images/${urlParts[1]}`

        const { error } = await supabase.storage
            .from('maintenance-images')
            .remove([filePath])

        if (error) {
            console.error('Delete error:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Photo deletion error:', error)
        return false
    }
}

/**
 * Delete photos when a maintenance request is completed/resolved
 */
export async function deletePhotosForRequest(requestId: string): Promise<void> {
    try {
        // Get the request to find image URL
        const { data: request, error } = await supabase
            .from('maintenance_requests')
            .select('image_url')
            .eq('id', requestId)
            .single()

        if (error || !request?.image_url) {
            return
        }

        // Delete the photo from storage
        await deletePhoto(request.image_url)

        // Update database to remove image reference
        await supabase
            .from('maintenance_requests')
            .update({
                image_url: null,
                hasImage: false
            })
            .eq('id', requestId)

    } catch (error) {
        console.error('Error deleting photos for request:', error)
    }
}
