/**
 * TEAM BLOCKS
 * Các blocks hiển thị thông tin đội ngũ, nhân viên
 * Category: 'Team' (sẽ merge vào category Team có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Team Blocks...');
  
  // ===== TEAM GRID =====
  editor.BlockManager.add('team-grid-4', {
    label: '4-Column Team',
    category: 'Team',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Meet Our Team</h2>
          <p class="text-xl text-center text-gray-600 mb-12">The talented people behind our success</p>
          <div class="grid md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 class="text-xl font-bold text-gray-900">John Doe</h3>
              <p class="text-gray-600 mb-2">CEO & Founder</p>
              <p class="text-sm text-gray-500">Leading the vision and strategy</p>
            </div>
            <div class="text-center">
              <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 class="text-xl font-bold text-gray-900">Jane Smith</h3>
              <p class="text-gray-600 mb-2">CTO</p>
              <p class="text-sm text-gray-500">Building amazing technology</p>
            </div>
            <div class="text-center">
              <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 class="text-xl font-bold text-gray-900">Mike Johnson</h3>
              <p class="text-gray-600 mb-2">Head of Design</p>
              <p class="text-sm text-gray-500">Creating beautiful experiences</p>
            </div>
            <div class="text-center">
              <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 class="text-xl font-bold text-gray-900">Sarah Wilson</h3>
              <p class="text-gray-600 mb-2">Marketing Director</p>
              <p class="text-sm text-gray-500">Growing our community</p>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('team-cards', {
    label: 'Team Cards',
    category: 'Team',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Our Leadership Team</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-1">Alex Thompson</h3>
                <p class="text-blue-600 font-medium mb-3">Chief Executive Officer</p>
                <p class="text-gray-600 mb-4">15+ years of experience in tech innovation and business strategy.</p>
                <div class="flex gap-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-1">Emily Chen</h3>
                <p class="text-purple-600 font-medium mb-3">Chief Technology Officer</p>
                <p class="text-gray-600 mb-4">Expert in scalable architecture and cutting-edge development.</p>
                <div class="flex gap-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-1">David Martinez</h3>
                <p class="text-green-600 font-medium mb-3">Chief Design Officer</p>
                <p class="text-gray-600 mb-4">Award-winning designer focused on user experience and innovation.</p>
                <div class="flex gap-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('team-list', {
    label: 'Team List',
    category: 'Team',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4">
        <div class="container mx-auto max-w-4xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Our Amazing Team</h2>
          <div class="space-y-6">
            <div class="flex items-center gap-6 p-6 bg-white rounded-lg shadow-md">
              <div class="w-20 h-20 bg-blue-500 rounded-full flex-shrink-0"></div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900">Robert Taylor</h3>
                <p class="text-blue-600 font-medium mb-2">Senior Developer</p>
                <p class="text-gray-600">Full-stack developer with expertise in modern web technologies.</p>
              </div>
            </div>
            <div class="flex items-center gap-6 p-6 bg-white rounded-lg shadow-md">
              <div class="w-20 h-20 bg-purple-500 rounded-full flex-shrink-0"></div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900">Lisa Anderson</h3>
                <p class="text-purple-600 font-medium mb-2">Product Manager</p>
                <p class="text-gray-600">Driving product strategy and delivering exceptional user experiences.</p>
              </div>
            </div>
            <div class="flex items-center gap-6 p-6 bg-white rounded-lg shadow-md">
              <div class="w-20 h-20 bg-green-500 rounded-full flex-shrink-0"></div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900">James Wilson</h3>
                <p class="text-green-600 font-medium mb-2">UX Designer</p>
                <p class="text-gray-600">Creating intuitive and beautiful user interfaces.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  console.log('✅ Team Blocks loaded with 3 new blocks');
}