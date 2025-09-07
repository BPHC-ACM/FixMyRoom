import { supabase } from '../supabaseClient'
import { deletePhoto } from './photoUpload'

/**
 * Clean up photos for all completed requests
 * This can be run periodically to ensure no orphaned photos remain
 */
export async function cleanupCompletedRequestPhotos(): Promise<{
    success: boolean
    deletedCount: number
    errors: string[]
}> {
    const errors: string[] = []
    let deletedCount = 0

    try {
        // Get all completed requests that have images
        const { data: completedRequests, error } = await supabase
            .from('maintenance_requests')
            .select('id, image_url, hasImage')
            .eq('status', 'completed')
            .eq('hasImage', true)
            .not('image_url', 'is', null)

        if (error) {
            errors.push(`Failed to fetch completed requests: ${error.message}`)
            return { success: false, deletedCount: 0, errors }
        }

        if (!completedRequests || completedRequests.length === 0) {
            return { success: true, deletedCount: 0, errors: [] }
        }

        // Delete photos for each completed request
        for (const request of completedRequests) {
            try {
                if (request.image_url) {
                    const deleted = await deletePhoto(request.image_url)

                    if (deleted) {
                        // Update database to remove image reference
                        const { error: updateError } = await supabase
                            .from('maintenance_requests')
                            .update({
                                image_url: null,
                                hasImage: false
                            })
                            .eq('id', request.id)

                        if (updateError) {
                            errors.push(`Failed to update request ${request.id}: ${updateError.message}`)
                        } else {
                            deletedCount++
                        }
                    } else {
                        errors.push(`Failed to delete photo for request ${request.id}`)
                    }
                }
            } catch (error) {
                errors.push(`Error processing request ${request.id}: ${error}`)
            }
        }

        return {
            success: errors.length === 0,
            deletedCount,
            errors
        }
    } catch (error) {
        errors.push(`Unexpected error: ${error}`)
        return { success: false, deletedCount: 0, errors }
    }
}

/**
 * Get statistics about photo storage usage
 */
export async function getPhotoStorageStats(): Promise<{
    totalRequestsWithPhotos: number
    completedRequestsWithPhotos: number
    pendingRequestsWithPhotos: number
    inProgressRequestsWithPhotos: number
}> {
    try {
        const { data: requests, error } = await supabase
            .from('maintenance_requests')
            .select('status, hasImage')
            .eq('hasImage', true)

        if (error || !requests) {
            return {
                totalRequestsWithPhotos: 0,
                completedRequestsWithPhotos: 0,
                pendingRequestsWithPhotos: 0,
                inProgressRequestsWithPhotos: 0
            }
        }

        const stats = requests.reduce((acc, request) => {
            acc.totalRequestsWithPhotos++
            switch (request.status) {
                case 'completed':
                    acc.completedRequestsWithPhotos++
                    break
                case 'pending':
                    acc.pendingRequestsWithPhotos++
                    break
                case 'in-progress':
                    acc.inProgressRequestsWithPhotos++
                    break
            }
            return acc
        }, {
            totalRequestsWithPhotos: 0,
            completedRequestsWithPhotos: 0,
            pendingRequestsWithPhotos: 0,
            inProgressRequestsWithPhotos: 0
        })

        return stats
    } catch (error) {
        console.error('Error getting photo storage stats:', error)
        return {
            totalRequestsWithPhotos: 0,
            completedRequestsWithPhotos: 0,
            pendingRequestsWithPhotos: 0,
            inProgressRequestsWithPhotos: 0
        }
    }
}
