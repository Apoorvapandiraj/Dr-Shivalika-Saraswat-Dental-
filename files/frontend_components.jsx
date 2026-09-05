// ================================================
// FRONTEND REACT COMPONENTS - 3D & ANIMATIONS
// ================================================

// ===================== 1. 3D HERO SECTION =====================

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Animated 3D Sphere Component
const RotatingSphere = () => {
  const meshRef = useRef(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={2}>
      <MeshDistortMaterial
        color="#3b82f6"
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.8}
      />
    </Sphere>
  );
};

export const HeroSection = () => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* 3D Canvas Background */}
      <Canvas className="absolute inset-0">
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls 
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <RotatingSphere />
      </Canvas>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            Dr. Shivalika Saraswat
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-blue-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Expert Healthcare Professional | Dental Specialist
          </motion.p>

          <motion.div
            className="flex gap-6 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">
              Book Appointment
            </button>
            <button className="px-8 py-3 border-2 border-blue-400 text-blue-400 rounded-lg font-semibold hover:bg-blue-400 hover:text-white transition-all duration-300">
              Learn More
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

// ===================== 2. EXPERIENCE TIMELINE SECTION =====================

export const ExperienceTimeline = ({ experiences }) => {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Professional Journey
        </motion.h2>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>

          {/* Timeline Items */}
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="w-5/12 p-6 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-300 cursor-pointer group">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full -translate-y-1/2 top-1/4 group-hover:w-6 group-hover:h-6 transition-all duration-300 z-10"></div>

                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                    <p className="text-blue-400">{exp.institution}</p>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{exp.year}</p>
                  <p className="text-gray-300">{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ===================== 3. GOOGLE REVIEWS WIDGET =====================

export const GoogleReviewsSection = ({ reviews, avgRating, totalReviews }) => {
  const [filteredReviews, setFilteredReviews] = React.useState(reviews);
  const [selectedRating, setSelectedRating] = React.useState(0);

  const handleRatingFilter = (rating) => {
    setSelectedRating(rating);
    if (rating === 0) {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.rating === rating));
    }
  };

  return (
    <section className="py-20 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold text-white mb-4">Patient Reviews</h2>
          <div className="flex justify-center items-center gap-4">
            <div className="flex items-center">
              <span className="text-5xl font-bold text-yellow-400">{avgRating.toFixed(1)}</span>
              <div className="ml-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-6 h-6 ${i < Math.round(avgRating) ? 'fill-current' : 'fill-gray-400'}`} viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400">{totalReviews} reviews</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rating Filter */}
        <motion.div
          className="flex justify-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {[0, 5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => handleRatingFilter(rating)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedRating === rating
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {rating === 0 ? 'All' : `${rating}★`}
            </button>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={index}
              className="p-6 bg-slate-700 rounded-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{review.authorName}</h4>
                  <div className="flex text-yellow-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-gray-400'}`} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-3">{review.text}</p>
              <p className="text-sm text-gray-400">{new Date(review.publishedAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===================== 4. VIDEO TESTIMONIALS CAROUSEL =====================

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

export const TestimonialsSection = ({ testimonials }) => {
  const [selectedVideo, setSelectedVideo] = React.useState(null);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Patient Testimonials
        </motion.h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="bg-slate-700 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full cursor-pointer"
                onClick={() => setSelectedVideo(testimonial)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-black group">
                  <img
                    src={testimonial.thumbnail}
                    alt={testimonial.patientName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white group-hover:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-2">{testimonial.patientName}</h4>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'fill-gray-400'}`} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm">{testimonial.title}</p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            className="bg-black rounded-lg max-w-4xl w-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black text-white p-2 rounded-full"
              >
                ✕
              </button>
              <video
                src={selectedVideo.videoFile.url}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

// ===================== 5. BOOKING SECTION =====================

import { useForm } from 'react-hook-form';
import { useState } from 'react';

export const BookingSection = ({ services, doctorId }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState(null);

  const selectedService = watch('service');

  const onSubmit = async (data) => {
    if (step === 1) {
      setBookingData(data);
      setStep(2);
    } else if (step === 2) {
      // Send OTP
      try {
        const response = await fetch('/api/bookings/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            phone: data.phone
          })
        });
        const result = await response.json();
        if (result.success) setStep(3);
      } catch (error) {
        console.error('Failed to send OTP:', error);
      }
    } else if (step === 3) {
      // Verify OTP and create booking
      try {
        const response = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bookingData,
            ...data,
            doctorId
          })
        });
        const result = await response.json();
        if (result.success) setStep(4);
      } catch (error) {
        console.error('Booking failed:', error);
      }
    }
  };

  return (
    <section className="py-20 bg-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold text-center text-white mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Book Your Appointment
        </motion.h2>

        <motion.div
          className="bg-slate-700 rounded-lg p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step Indicator */}
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all duration-300 ${
                      s <= step
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-600 text-gray-400'
                    }`}
                  >
                    {s < step ? '✓' : s}
                  </div>
                  <p className="text-xs text-gray-400">
                    {s === 1 && 'Service'}
                    {s === 2 && 'Details'}
                    {s === 3 && 'Verify'}
                    {s === 4 && 'Confirm'}
                  </p>
                </div>
              ))}
            </div>

            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-3">Select Service</label>
                  <select
                    {...register('service', { required: 'Service is required' })}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Choose a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </select>
                  {errors.service && <p className="text-red-400 text-sm mt-2">{errors.service.message}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">Select Date</label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  {errors.date && <p className="text-red-400 text-sm mt-2">{errors.date.message}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">Select Time</label>
                  <input
                    type="time"
                    {...register('time', { required: 'Time is required' })}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  {errors.time && <p className="text-red-400 text-sm mt-2">{errors.time.message}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Patient Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name</label>
                  <input
                    {...register('name', { required: 'Name is required', minLength: 2 })}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Phone Number</label>
                  <input
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Phone must be 10 digits'
                      }
                    })}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-2">{errors.phone.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-gray-300 text-center mb-4">We've sent an OTP to your email and phone</p>
                <input
                  {...register('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'OTP must be 6 digits'
                    }
                  })}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                />
                {errors.otp && <p className="text-red-400 text-sm mt-2">{errors.otp.message}</p>}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                <p className="text-gray-300">A confirmation email has been sent to your inbox.</p>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-6 py-2 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
                >
                  {step === 3 ? 'Verify & Confirm' : 'Next'}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};
