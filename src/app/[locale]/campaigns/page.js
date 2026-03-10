'use client';

import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

const issues = [
{
title_en:"Transparent Government",
title_ne:"पारदर्शी शासन",
desc_en:"Building a corruption-free and accountable local government for Kalikamai.",
desc_ne:"कालिकामाईका लागि भ्रष्टाचारमुक्त र जिम्मेवार स्थानीय सरकार।"
},
{
title_en:"Youth Empowerment",
title_ne:"युवा सशक्तिकरण",
desc_en:"Creating employment and leadership opportunities for youth.",
desc_ne:"युवाहरूका लागि रोजगारी र नेतृत्वका अवसरहरू सिर्जना।"
},
{
title_en:"Education Development",
title_ne:"शिक्षा विकास",
desc_en:"Improving schools and promoting digital learning.",
desc_ne:"विद्यालय सुधार र डिजिटल शिक्षाको प्रवर्द्धन।"
},
{
title_en:"Healthcare Access",
title_ne:"स्वास्थ्य सेवा",
desc_en:"Strengthening rural health posts and access to medical services.",
desc_ne:"ग्रामीण स्वास्थ्य सेवा र स्वास्थ्य चौकीहरू सुदृढ बनाउने।"
},
{
title_en:"Infrastructure Growth",
title_ne:"पूर्वाधार विकास",
desc_en:"Roads, drinking water, electricity and digital connectivity.",
desc_ne:"सडक, खानेपानी, विद्युत र डिजिटल पहुँचको विकास।"
}
];

const outcomes = [
{
title_en:"Youth Training Programs",
title_ne:"युवा तालिम कार्यक्रम",
desc_en:"200+ youths trained in leadership and entrepreneurship.",
desc_ne:"२०० भन्दा बढी युवालाई नेतृत्व र उद्यमशीलता तालिम।"
},
{
title_en:"Health Camps Organized",
title_ne:"स्वास्थ्य शिविर आयोजना",
desc_en:"Free health camps benefiting hundreds of villagers.",
desc_ne:"सयौं ग्रामीणलाई लाभ पुगेको निःशुल्क स्वास्थ्य शिविर।"
},
{
title_en:"School Improvements",
title_ne:"विद्यालय सुधार",
desc_en:"Support for improving local schools and digital learning.",
desc_ne:"विद्यालय सुधार तथा डिजिटल शिक्षामा सहयोग।"
},
{
title_en:"Tree Plantation",
title_ne:"वृक्षारोपण अभियान",
desc_en:"Large scale plantation campaigns for environmental protection.",
desc_ne:"वातावरण संरक्षणका लागि वृक्षारोपण अभियान।"
}
];

const timeline = [
{
year:"2025",
title_en:"Chhath Social Service",
title_ne:"छठ सामाजिक सेवा",
desc_en:"Milk distribution and support programs for communities.",
desc_ne:"समुदायका लागि दूध वितरण तथा सहयोग कार्यक्रम।"
},
{
year:"2024",
title_en:"Youth Leadership Meetings",
title_ne:"युवा नेतृत्व बैठक",
desc_en:"Meetings with youth groups to discuss development plans.",
desc_ne:"विकासका योजनाबारे युवासँग छलफल।"
},
{
year:"2023",
title_en:"Education Awareness",
title_ne:"शिक्षा सचेतना",
desc_en:"Programs promoting education in rural schools.",
desc_ne:"ग्रामीण विद्यालयमा शिक्षा प्रवर्द्धन कार्यक्रम।"
}
];

const stats = [
{label_en:"Supporters",label_ne:"समर्थक",value:1500},
{label_en:"Volunteers",label_ne:"स्वयंसेवक",value:320},
{label_en:"Villages Reached",label_ne:"गाउँ पुगेका",value:25},
{label_en:"Campaign Events",label_ne:"कार्यक्रम",value:40}
];

export default function CampaignsPage({ params: { locale } }) {

const isNepali = locale === 'ne';

return (

<div className="min-h-screen bg-dark-950 pt-24 pb-16 overflow-hidden">

{/* HERO SECTION */}

<div className="relative py-16 bg-[#080000] mb-16 overflow-hidden">

<div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(200,13,13,0.08),transparent)]" />

<div className="container-custom relative z-10 text-center">

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.7}}
>

<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-900/40 border border-primary-700/40 rounded-full text-primary-400 text-xs font-bold uppercase tracking-widest mb-6">

<Megaphone size={11} className="fill-primary-500 text-primary-500"/>

<span className={isNepali?'font-nepali':''}>
{isNepali ? "अभियान" : "CAMPAIGNS"}
</span>

</div>

<h1 className={`text-white mb-4 ${isNepali?'font-nepali text-5xl md:text-6xl font-black':'font-display text-7xl md:text-9xl uppercase tracking-tight'}`}>

{isNepali ? (
<>अभियान <span className="text-gradient">कार्य</span></>
) : (
<>CAMPAIGN <span className="text-gradient">OUTCOMES</span></>
)}

</h1>

<p className={`text-dark-400 max-w-xl mx-auto text-base ${isNepali?'font-nepali':''}`}>

{isNepali
? "कालिकामाईको विकासका लागि मुख्य अभियानहरू।"
: "Key development campaigns for Kalikamai."}

</p>

</motion.div>

</div>

</div>


{/* ISSUES GRID */}

<div className="container-custom mb-24">

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

{issues.map((item,i)=>{

const colors=['#ff3333','#60a5fa','#34d399','#fbbf24','#f472b6']
const color=colors[i % colors.length]

return(

<motion.div
key={i}
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}}
transition={{delay:i*0.1,duration:0.6}}
whileHover={{y:-5}}
className="group card-dark p-7 hover:shadow-card-hover hover:border-primary-700/40 transition-all duration-300 relative overflow-hidden"
>

<div
className="absolute top-0 left-0 w-full h-0.5 opacity-60"
style={{background:`linear-gradient(90deg, transparent, ${color}, transparent)`}}
/>

<h3 className={`text-white font-bold text-lg mb-2 ${isNepali?'font-nepali':''}`}>
{isNepali ? item.title_ne : item.title_en}
</h3>

<p className={`text-dark-400 text-sm leading-relaxed ${isNepali?'font-nepali':''}`}>
{isNepali ? item.desc_ne : item.desc_en}
</p>

<div className="absolute bottom-4 right-5 font-display text-5xl text-primary-900/20 group-hover:text-primary-800/30 transition-colors">
{String(i+1).padStart(2,'0')}
</div>

</motion.div>

)

})}

</div>

</div>


{/* CAMPAIGN OUTCOMES */}

<div className="container-custom mb-24">

<h2 className={`text-white text-3xl mb-10 ${isNepali?'font-nepali':''}`}>
{isNepali ? "अभियान उपलब्धि" : "Campaign Outcomes"}
</h2>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

{outcomes.map((item,i)=>{

const colors = [
'#ff3333',
'#60a5fa',
'#34d399',
'#fbbf24',
'#f472b6'
]

const color = colors[i % colors.length]

return(

<motion.div
key={i}
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}}
transition={{delay:i*0.1,duration:0.6}}
whileHover={{y:-5}}
className="group card-dark p-7 hover:shadow-card-hover hover:border-primary-700/40 transition-all duration-300 relative overflow-hidden"
>

{/* TOP GRADIENT LINE */}

<div
className="absolute top-0 left-0 w-full h-0.5 opacity-60"
style={{background:`linear-gradient(90deg, transparent, ${color}, transparent)`}}
/>

{/* TITLE */}

<h3 className={`text-white font-bold text-lg mb-2 ${isNepali?'font-nepali':''}`}>
{isNepali ? item.title_ne : item.title_en}
</h3>

{/* DESCRIPTION */}

<p className={`text-dark-400 text-sm leading-relaxed ${isNepali?'font-nepali':''}`}>
{isNepali ? item.desc_ne : item.desc_en}
</p>

{/* NUMBER */}

<div className="absolute bottom-4 right-5 font-display text-5xl text-primary-900/20 group-hover:text-primary-800/30 transition-colors">
{String(i+1).padStart(2,'0')}
</div>

</motion.div>

)

})}

</div>

</div>

{/* CAMPAIGN TIMELINE */}

<div className="container-custom mb-24">

<h2 className={`text-white text-3xl mb-10 ${isNepali?'font-nepali':''}`}>
{isNepali ? "अभियान समयरेखा" : "Campaign Timeline"}
</h2>

<div className="space-y-6">

{timeline.map((item,i)=>(

<div key={i} className="border-l-4 border-primary-600 pl-6">

<p className="text-primary-500 text-sm">{item.year}</p>

<h3 className={`text-white font-semibold ${isNepali?'font-nepali':''}`}>
{isNepali ? item.title_ne : item.title_en}
</h3>

<p className={`text-dark-400 text-sm ${isNepali?'font-nepali':''}`}>
{isNepali ? item.desc_ne : item.desc_en}
</p>

</div>

))}

</div>

</div>


{/* IMPACT STATISTICS */}

<div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

{stats.map((s,i)=>(

<div key={i}>

<p className="text-4xl font-bold text-primary-500">
{s.value}+
</p>

<p className={`text-dark-300 ${isNepali?'font-nepali':''}`}>
{isNepali ? s.label_ne : s.label_en}
</p>

</div>

))}

</div>

</div>

);
}