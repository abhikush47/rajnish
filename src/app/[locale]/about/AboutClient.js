'use client'

import { motion } from 'framer-motion'
import { User, Award, Heart, Zap } from 'lucide-react'
import Image from 'next/image'

import rajnish from '@/images/rajnish.png'

export default function AboutClient({ locale }) {

const isNepali = locale === 'ne'

const bio = {
ne:{
title:'रजनीश कुशवाहाको बारेमा',
subtitle:'युवा नेता, सामाजिक कार्यकर्ता र आरमोक्षका संस्थापक',
body:`रजनीश कुशवाहा कालिकामाई गाउँपालिका, पर्सा, नेपालका एक उदीयमान युवा राजनीतिज्ञ र सामाजिक कार्यकर्ता हुन्। जेन-Z पुस्ताका प्रतिनिधिका रूपमा, उनले आफ्नो समुदायको विकास र युवाहरूको सशक्तिकरणका लागि अथक प्रयास गर्दै आएका छन्।

आरमोक्ष एनजीओको संस्थापकका रूपमा, रजनीशले शिक्षा, स्वास्थ्य र सामाजिक न्यायका क्षेत्रमा उल्लेखनीय काम गरेका छन्। उनको नेतृत्वमा सयौं युवाहरूले स्वयंसेवकका रूपमा काम गर्दै समाज परिवर्तनमा योगदान पुर्‍याएका छन्।`
},

en:{
title:'About Rajnish Kushwaha',
subtitle:'Youth Leader, Social Worker & Founder of RMoksha',
body:`Rajnish Kushwaha is an emerging youth politician and social worker from Kalikamai Gaupalika, Parsa, Nepal. As a representative of the Gen-Z generation, he has been tirelessly working for the development of his community and the empowerment of youth.

As the founder of RMoksha NGO, Rajnish has done remarkable work in the fields of education, health, and social justice. Under his leadership, hundreds of young people have contributed to social transformation as volunteers.`
}
}

const achievements = [
{icon:Award,labelNe:'आरमोक्ष एनजीओ संस्थापक',labelEn:'Founder of RMoksha NGO'},
{icon:User,labelNe:'५०० भन्दा बढी स्वयंसेवक',labelEn:'500+ Volunteers Led'},
{icon:Heart,labelNe:'२५ गाउँमा सेवा',labelEn:'Served 25 Villages'},
{icon:Zap,labelNe:'मेयर उम्मेदवार २०८४',labelEn:'Mayor Candidate 2084'}
]

const content = isNepali ? bio.ne : bio.en

return (

<div className="min-h-screen bg-dark-950 pt-24 pb-16">

<div className="container-custom">

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.7}}
className="max-w-5xl mx-auto"
>

{/* TITLE */}

<div className="mb-12">

<div className="text-primary-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">
{isNepali ? 'परिचय' : 'ABOUT'}
</div>

<h1 className={`text-white mb-3 ${isNepali?'font-nepali text-4xl md:text-5xl font-black':'font-display text-6xl md:text-7xl uppercase tracking-tight'}`}>
{content.title}
</h1>

<p className={`text-primary-400 text-lg ${isNepali?'font-nepali':''}`}>
{content.subtitle}
</p>

<div className="w-16 h-[2px] bg-primary-600 mt-6"/>
</div>


<div className="grid lg:grid-cols-3 gap-10">

{/* BIO */}

<div className="lg:col-span-2">

<div className="card-dark p-8 mb-6">

<div className={`text-dark-300 leading-relaxed whitespace-pre-line ${isNepali?'font-nepali text-base':'text-sm'}`}>
{content.body}
</div>

</div>

{/* ACHIEVEMENTS */}

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

{achievements.map(({icon:Icon,labelNe,labelEn},i)=>(
<motion.div
key={i}
initial={{opacity:0,scale:0.9}}
animate={{opacity:1,scale:1}}
transition={{delay:0.2+i*0.1}}
className="card-dark p-5 flex items-center gap-3 hover:scale-[1.03] transition"
>

<div className="w-9 h-9 bg-primary-900/40 rounded-md flex items-center justify-center flex-shrink-0">

<Icon size={16} className="text-primary-500"/>

</div>

<span className={`text-sm text-white font-medium ${isNepali?'font-nepali':''}`}>
{isNepali ? labelNe : labelEn}
</span>

</motion.div>
))}

</div>

</div>


{/* SIDEBAR */}

<div className="space-y-6">

{/* PROFILE */}

<div className="card-dark p-6 text-center relative overflow-hidden">

{/* glow */}

<div className="absolute w-40 h-40 bg-primary-600/20 blur-3xl rounded-full top-5 left-1/2 -translate-x-1/2"/>

<div className="relative z-10">

<Image
src={rajnish}
alt="Rajnish Kushwaha"
width={140}
height={140}
className="mx-auto rounded-full object-cover border-4 border-primary-800 shadow-lg"
/>

<div className={`text-white font-bold text-lg mt-4 ${isNepali?'font-nepali':'font-display tracking-wider'}`}>
{isNepali ? 'रजनीश कुशवाहा' : 'RAJNISH KUSHWAHA'}
</div>

<div className={`text-primary-500 text-xs mt-1 uppercase tracking-widest ${isNepali?'font-nepali':''}`}>
{isNepali ? 'युवा नेता' : 'Youth Leader'}
</div>

</div>

</div>


{/* INFO CARD */}

<div className="card-dark p-6 space-y-4">

{[
{labelNe:'जिल्ला',labelEn:'District',valueNe:'पर्सा',valueEn:'Parsa'},
{labelNe:'गाउँपालिका',labelEn:'Gaupalika',valueNe:'कालिकामाई',valueEn:'Kalikamai'},
{labelNe:'देश',labelEn:'Country',valueNe:'नेपाल',valueEn:'Nepal'},
{labelNe:'पार्टी',labelEn:'Party',valueNe:'स्वतन्त्र',valueEn:'Independent'}
].map((row,i)=>(
<div key={i} className="flex justify-between items-center border-b border-primary-900/20 pb-3 last:border-0 last:pb-0">

<span className={`text-dark-500 text-xs uppercase tracking-widest ${isNepali?'font-nepali':''}`}>
{isNepali ? row.labelNe : row.labelEn}
</span>

<span className={`text-white text-sm font-medium ${isNepali?'font-nepali':''}`}>
{isNepali ? row.valueNe : row.valueEn}
</span>

</div>
))}

</div>

</div>

</div>

</motion.div>

</div>

</div>

)
}