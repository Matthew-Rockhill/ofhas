<template>
  <div class="bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <div class="min-h-[70vh] flex flex-col justify-center items-center text-center px-4 pt-12 pb-4">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
        Organisational Financial Health Assessment
      </h1>
      <p class="text-lg md:text-xl mb-8 max-w-2xl text-gray-700">
        Discover your organisation's financial health across the 6 Pillars. 
        Take our assessment to gain actionable insights and build a stronger financial foundation.
      </p>
      <router-link to="/register" class="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium 
        shadow-lg hover:bg-blue-700 transition-colours duration-200">
        Start Your Assessment
      </router-link>
    </div>

    <!-- Workshop & Client Meeting Image Ticker -->
    <div class="bg-[#EFF6FF] pt-2 pb-16">
      <div class="relative">
        <div class="flex animate-scroll-left">
          <!-- First set of images -->
          <div v-for="img in tickerImages" :key="img" class="flex-shrink-0 mx-6">
            <div class="w-96 h-60 bg-gray-200 rounded-lg shadow-md overflow-hidden">
              <img 
                :src="img" 
                alt="Workshop/Client Meeting"
                :class="['w-full h-full object-cover', (img === '/workshop_15.jpg' || img === '/workshop_13.jpg') ? 'object-top' : '']"
              />
            </div>
          </div>
          <!-- Duplicate set for seamless scrolling -->
          <div v-for="img in tickerImages" :key="'dup-' + img" class="flex-shrink-0 mx-6">
            <div class="w-96 h-60 bg-gray-200 rounded-lg shadow-md overflow-hidden">
              <img 
                :src="img" 
                alt="Workshop/Client Meeting"
                :class="['w-full h-full object-cover', (img === '/workshop_15.jpg' || img === '/workshop_13.jpg') ? 'object-top' : '']"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pillars Section -->
    <div class="max-w-7xl mx-auto px-4 py-24">
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

      <!-- Video Section -->
      <div class="max-w-4xl mx-auto mt-16">
        <h3 class="text-2xl font-bold text-center mb-8 text-blue-900">Hear from the creator of OFHAS, Ray Partridge</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
          <iframe
            src="https://player.vimeo.com/video/1089286362?h=4737aacfd6"
            class="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg border-0"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
            title="Financial Health Assessment Overview"
          ></iframe>
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

    <!-- Story Section -->
    <div class="py-24">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center gap-12">
          <!-- Left Column: Image -->
          <div class="w-full md:w-1/2">
            <div class="relative rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/workshop_17.jpg" 
                alt="Ray Partridge - Creator of OFHAS"
                class="w-full h-auto"
              />
            </div>
          </div>
          
          <!-- Right Column: Story -->
          <div class="w-full md:w-1/2">
            <h2 class="text-3xl font-bold mb-6 text-blue-900">The Story Behind OFHAS</h2>
            <p class="text-lg text-gray-700 mb-6">
              With over 40 years of experience in the financial world, Ray Partridge has worked with blue chip businesses, development organisations, and start-up enterprises across Europe and Southern Africa.
            </p>
            <p class="text-lg text-gray-700 mb-6">
              His journey has been driven by a passion for helping organisations build strong financial foundations. Through OFHAS, Ray shares his wealth of knowledge, providing teams with a deeper understanding of financial performance that enables better business decisions.
            </p>
            <p class="text-lg text-gray-700">
              Whether you're leading a well-established medium-sized business or a micro startup, the 6 pillars of financial health remain equally relevant—we simply adapt our approach to match your specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="py-24 text-center bg-blue-50 w-full">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold mb-6 text-blue-900">Ready to improve your financial health?</h2>
        <p class="text-lg mb-8 max-w-2xl mx-auto text-gray-700">
          Take our assessment today and receive a personalised report with actionable recommendations.
        </p>
        <router-link to="/register" class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium 
          shadow-md hover:bg-blue-700 transition-colours duration-200">
          Start Free Assessment
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      tickerImages: [
        '/workshop_1.jpg',
        '/workshop_3.jpg',
        '/workshop_6.jpg',
        '/workshop_8.jpg',
        '/workshop_15.jpg',
        '/workshop_13.jpg'
      ],
      pillars: [
        {
          title: 'Business Plan',
          description: 'Establish your mission, vision, forecasts, and funding strategy for sustainable growth.'
        },
        {
          title: 'Break Even',
          description: 'Understand product costing, mark-up, and the volume needed to cover overheads.'
        },
        {
          title: 'Blueprint',
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

<style>
@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll-left {
  animation: scroll-left 30s linear infinite;
  display: flex;
  width: max-content;
}

.animate-scroll-left:hover {
  animation-play-state: paused;
}
</style>