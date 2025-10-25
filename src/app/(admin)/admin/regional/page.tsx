/**
 * @fileoverview Regional Data Index Page - Redirects to Provinces
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { redirect } from 'next/navigation'

/**
 * Regional Data Index Page
 * 
 * Automatically redirects to provinces page as the default view
 */
export default function RegionalDataPage() {
  redirect('/admin/regional/provinces')
}
