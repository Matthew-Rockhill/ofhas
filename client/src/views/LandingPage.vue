<template>
  <div class="bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <div class="min-h-[70vh] flex flex-col justify-center items-center text-center px-4 py-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
        Organisational Financial Health Assessment
      </h1>
      <p class="text-lg md:text-xl mb-8 max-w-2xl text-gray-700">
        Discover your organisation's financial health across the 6 Pillars. 
        Take our assessment to gain actionable insights and build a stronger financial foundation.
      </p>
      <router-link to="/register" class="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium 
        shadow-lg hover:bg-blue-700 transition-colors duration-200">
        Start Your Assessment
      </router-link>
    </div>

    <!-- Pillars Section -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center mb-12 text-blue-900">The 6 Pillars of Financial Health</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="(pillar, index) in pillars" :key="index" 
          class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <span class="text-blue-700 font-bold text-lg">{{ index + 1 }}</span>
          </div>
          <h3 class="text-xl font-semibold mb-3 text-blue-900">{{ pillar.title }}</h3>
          <p class="text-gray-700">{{ pillar.description }}</p>
        </div>
      </div>
    </div>

    <!-- Benefits Section -->
    <div class="bg-blue-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Why Assess Your Financial Health?</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-blue-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold">✓</span>
            </div>
            <h3 class="text-xl font-semibold mb-3">Identify Weaknesses</h3>
            <p class="text-blue-100">Discover areas where your financial infrastructure needs strengthening</p>
          </div>
          
          <div class="text-center">
            <div class="bg-blue-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold">↗</span>
            </div>
            <h3 class="text-xl font-semibold mb-3">Improve Decision Making</h3>
            <p class="text-blue-100">Gain insights that lead to better business and financial decisions</p>
          </div>
          
          <div class="text-center">
            <div class="bg-blue-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold">♺</span>
            </div>
            <h3 class="text-xl font-semibold mb-3">Build Sustainability</h3>
            <p class="text-blue-100">Create efficient and effective financial infrastructure that lasts</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="py-16 text-center">
      <h2 class="text-3xl font-bold mb-6 text-blue-900">Ready to improve your financial health?</h2>
      <p class="text-lg mb-8 max-w-2xl mx-auto text-gray-700">
        Take our assessment today and receive a personalized report with actionable recommendations.
      </p>
      <router-link to="/register" class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium 
        shadow-md hover:bg-blue-700 transition-colors duration-200">
        Start Free Assessment
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      pillars: [
        {
          title: 'Business Plan',
          description: 'Establish your mission, vision, forecasts, and funding strategy for sustainable growth.'
        },
        {
          title: 'Break Even and Margin',
          description: 'Understand product costing, mark-up, and the volume needed to cover overheads.'
        },
        {
          title: 'Blueprint - Systems and Procedures',
          description: 'Create robust processes and adopt appropriate systems to manage finances effectively.'
        },
        {
          title: 'Actual Results',
          description: 'Maintain timely and accurate reporting with KPIs, graphics, and budget comparisons.'
        },
        {
          title: 'Bank',
          description: 'Monitor balances, compare forecasts, and regularly update your financial outlook.'
        },
        {
          title: 'Compliance',
          description: 'Stay on top of all regulatory requirements, returns, and industry-specific obligations.'
        }
      ]
    }
  }
}
</script>