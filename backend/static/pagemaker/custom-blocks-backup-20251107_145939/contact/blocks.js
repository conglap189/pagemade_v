/**
 * CONTACT BLOCKS
 * Các blocks liên hệ, form liên hệ
 * Category: 'Contact' (sẽ merge vào category Contact có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Contact Blocks...');
  
  // ===== CONTACT FORM =====
  editor.BlockManager.add('contact-form', {
    label: 'Contact Form',
    category: 'Contact',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4">
        <div class="container mx-auto max-w-4xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Get in Touch</h2>
          <p class="text-xl text-center text-gray-600 mb-12">We'd love to hear from you</p>
          <div class="bg-white rounded-xl shadow-lg p-8">
            <form class="space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="John">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Doe">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="john@example.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="How can we help?">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="5" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tell us more about your needs..."></textarea>
              </div>
              <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('contact-info', {
    label: 'Contact Info',
    category: 'Contact',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Contact Information</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Address</h3>
              <p class="text-gray-600">123 Business Street<br>Suite 100<br>New York, NY 10001</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Phone</h3>
              <p class="text-gray-600">+1 (555) 123-4567<br>+1 (555) 987-6543</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p class="text-gray-600">info@company.com<br>support@company.com</p>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('contact-split', {
    label: 'Split Contact',
    category: 'Contact',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,3H11V11H3V3M13,3H21V11H13V3M3,13H11V21H3V13M13,13H21V21H13V13Z"/>
    </svg>`,
    content: `
      <div class="grid md:grid-cols-2 min-h-screen">
        <div class="bg-gray-900 text-white p-12 flex flex-col justify-center">
          <h2 class="text-4xl font-bold mb-6">Let's Work Together</h2>
          <p class="text-xl text-gray-300 mb-8">
            Have a project in mind? We'd love to hear about it. Send us a message and we'll respond as soon as possible.
          </p>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2Z"/>
                </svg>
              </div>
              <div>
                <div class="font-semibold">Office</div>
                <div class="text-gray-400">123 Business Street, New York</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
              </div>
              <div>
                <div class="font-semibold">Phone</div>
                <div class="text-gray-400">+1 (555) 123-4567</div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white p-12 flex flex-col justify-center">
          <form class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your name">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your message..."></textarea>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Send Message
            </button>
          </form>
        </div>
      </div>
    `
  });

  console.log('✅ Contact Blocks loaded with 3 new blocks');
}