
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Star, 
  BookOpen, 
  Globe, 
  Map, 
  Users, 
  Award, 
  Calendar, 
  Scroll,
  Languages,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Navbar from '@/components/NavBar';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Play } from './Play';

const AboutPage = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 md:px-8">
      <Navbar />
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-baloo font-bold bg-clip-text text-transparent bg-gradient-to-r from-kid-purple to-kid-blue mb-6">
            About Kannada
          </h1>
          <div className="flex justify-center mb-8">
            <div className="h-1 w-24 bg-gradient-to-r from-kid-purple to-kid-blue rounded-full"></div>
          </div>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 mb-10 font-nunito">
            Discover the beauty, history, and cultural significance of one of India's classical languages
          </p>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-1 rounded-full bg-gradient-to-r from-kid-purple to-kid-blue inline-block mb-10"
          >
            <div className="bg-white rounded-full p-1">
              <div className="text-6xl md:text-8xl font-baloo bg-gradient-to-r from-kid-purple to-kid-blue bg-clip-text text-transparent p-6">
                ಕನ್ನಡ
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Language Info Section */}
      <section className="py-16 bg-purple-50 rounded-3xl my-16">
        <div className="container mx-auto">
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4"
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow h-full overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Globe className="h-8 w-8 text-kid-purple mr-3" />
                    <h3 className="text-xl font-baloo font-bold">Origin & Region</h3>
                  </div>
                  <p className="text-gray-700">
                    Kannada is primarily spoken in the Indian state of Karnataka and parts of neighboring states.
                    It's one of the oldest Dravidian languages with a history dating back to around 450 CE.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow h-full overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Users className="h-8 w-8 text-kid-blue mr-3" />
                    <h3 className="text-xl font-baloo font-bold">Speakers & Influence</h3>
                  </div>
                  <p className="text-gray-700">
                    Kannada is spoken by about 45 million people worldwide. It's the official language of 
                    Karnataka and one of India's 22 scheduled languages recognized in the constitution.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow h-full overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-8 w-8 text-kid-green mr-3" />
                    <h3 className="text-xl font-baloo font-bold">Classical Status</h3>
                  </div>
                  <p className="text-gray-700">
                    In 2008, Kannada was officially recognized as a Classical Language of India due to its rich 
                    literary history and antiquity, joining Sanskrit, Tamil, and Telugu with this prestigious status.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow h-full overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-8 w-8 text-kid-orange mr-3" />
                    <h3 className="text-xl font-baloo font-bold">History & Evolution</h3>
                  </div>
                  <p className="text-gray-700">
                    The earliest Kannada inscription dates back to 450 CE (Halmidi inscription). The language has evolved 
                    through three distinct phases: Old Kannada (450-1200 CE), Middle Kannada (1200-1700 CE), and Modern Kannada (1700 CE to present).
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow h-full overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Scroll className="h-8 w-8 text-kid-purple mr-3" />
                    <h3 className="text-xl font-baloo font-bold">Literature & Culture</h3>
                  </div>
                  <p className="text-gray-700">
                    Kannada has a rich literary tradition spanning centuries. The earliest works include Kavirajamarga (850 CE), 
                    and the language boasts eight Jnanpith Award winners, the highest number for any Indian language.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow h-full overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Languages className="h-8 w-8 text-kid-blue mr-3" />
                    <h3 className="text-xl font-baloo font-bold">Script & Structure</h3>
                  </div>
                  <p className="text-gray-700">
                    Kannada uses its own script derived from the Brahmi script. It has 49 letters in its alphabet,
                    with 13 vowels (swaragalu) and 34 consonants (vyanjanagalu), and follows an alpha-syllabic writing system.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Alphabet Showcase */}
      <section className="py-16">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-6">Kannada Alphabet</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              The Kannada script consists of vowels (swaragalu) and consonants (vyanjanagalu), 
              forming a beautiful and structured writing system.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-8">
            {Array.from({ length: 12 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <span className="text-4xl md:text-5xl font-baloo mb-2">
                  {kannadaAlphabet[index]?.character || "ಅ"}
                </span>
                <span className="text-sm text-gray-600">
                  {kannadaAlphabet[index]?.name || "a"}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/learn">
              <Button className="btn-primary text-lg px-8 py-6 rounded-full">
                Learn Kannada Alphabet
                <BookOpen className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl my-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-4">
              <span className="inline-flex items-center">
                <Sparkles className="h-8 w-8 text-yellow-500 mr-2" />
                Fun Facts About Kannada
              </span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.ul 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
              className="space-y-6"
            >
              {[
                "Kannada is one of the few languages to have received the 'Classical Language' status in India.",
                "The Kannada script evolved from the ancient Kadamba script.",
                "Kannada is the third oldest of the four major Dravidian languages.",
                "The Kannada film industry, known as 'Sandalwood', is one of the largest film industries in India.",
                "The oldest known Kannada dictionary, 'Amarakosha', dates back to the 9th century."
              ].map((fact, index) => (
                <motion.li 
                  key={index}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                  }}
                  className="flex items-start bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm"
                >
                  <Star className="text-yellow-500 h-6 w-6 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-lg">{fact}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* Learn and Play CTA */}
      <section className="py-16">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-kid-purple/10 to-kid-blue/10 rounded-3xl p-8 md:p-12 text-center max-w-5xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-baloo font-bold mb-6">
              Start Your Kannada Journey Today!
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Whether you're a complete beginner or looking to improve your skills, 
              our interactive learning tools and games make learning Kannada fun for children and adults alike!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/learn">
                <Button className="btn-primary text-lg px-8 py-6 rounded-full w-full sm:w-auto">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start Learning
                </Button>
              </Link>
              <Link href="/play">
                <Button className="btn-secondary text-lg px-8 py-6 rounded-full w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Play Games
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;