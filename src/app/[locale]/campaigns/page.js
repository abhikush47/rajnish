'use client';
import { motion } from 'framer-motion';

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

const activities = [
{
year:"2025",
title_en:"Chhath Social Service",
title_ne:"छठ सामाजिक सेवा",
desc_en:"Milk distribution and community support program during Chhath festival.",
desc_ne:"छठ पर्वमा दूध वितरण तथा सामाजिक सहयोग कार्यक्रम।"
},
{
year:"2025",
title_en:"Anti-Corruption Voice",
title_ne:"भ्रष्टाचार विरुद्ध आवाज",
desc_en:"Public awareness campaign against corruption in Kalikamai.",
desc_ne:"कालिकामाईमा भ्रष्टाचार विरुद्ध जनचेतना अभियान।"
},
{
year:"2024",
title_en:"Youth Leadership Meetings",
title_ne:"युवा नेतृत्व बैठक",
desc_en:"Meetings with youth groups to discuss development ideas.",
desc_ne:"विकासका विषयमा युवासँग छलफल।"
}
];

const stats = [
{label_en:"Supporters",label_ne:"समर्थक",value:1500},
{label_en:"Volunteers",label_ne:"स्वयंसेवक",value:320},
{label_en:"Areas Reached",label_ne:"क्षेत्र पुगेका",value:12},
{label_en:"Campaign Events",label_ne:"कार्यक्रम",value:40}
];

export default function CampaignsPage({ params: { locale } }) {

const isNepali = locale === 'ne';

return (

<div className="min-h-screen bg-dark-950 pt-24 pb-16">

<div className="container-custom">

<motion.div
initial={{ opacity:0, y:30 }}
animate={{ opacity:1, y:0 }}
transition={{ duration:0.7 }}
>

{/* HEADER */}

<div className="text-primary-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">
{isNepali ? 'अभियानहरू' : 'Campaigns'}
</div>

<h1 className={`text-white mb-6 ${isNepali ? 'font-nepali text-4xl font-black' : 'font-display text-7xl uppercase tracking-tight'}`}>
{isNepali ? 'अभियानहरू' : 'Campaigns'}
</h1>

<div className="w-16 h-0.5 bg-primary-700 mb-12"/>

{/* CAMPAIGN ISSUES */}

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">

{issues.map((item,index)=>(
<motion.div
key={index}
initial={{opacity:0,y:30}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}
}
transition={{delay:index*0.1}}
className="card-dark p-6 hover:border-primary-600 transition"
>

<h3 className={`text-white font-bold mb-3 ${isNepali?'font-nepali':''}`}>
{isNepali ? item.title_ne : item.title_en}
</h3>

<p className={`text-dark-400 text-sm ${isNepali?'font-nepali':''}`}>
{isNepali ? item.desc_ne : item.desc_en}
</p>

</motion.div>
))}

</div>

{/* CAMPAIGN ACTIVITIES */}

<div className="card-dark p-10 mb-20">

<h2 className={`text-white text-2xl mb-8 ${isNepali?'font-nepali':''}`}>
{isNepali ? "अभियान गतिविधि" : "Campaign Activities"}
</h2>

<div className="space-y-6">

{activities.map((act,index)=>(

<div key={index} className="border-l-4 border-primary-600 pl-6">

<p className="text-primary-500 text-sm">{act.year}</p>

<h3 className={`text-white font-semibold ${isNepali?'font-nepali':''}`}>
{isNepali ? act.title_ne : act.title_en}
</h3>

<p className={`text-dark-400 text-sm ${isNepali?'font-nepali':''}`}>
{isNepali ? act.desc_ne : act.desc_en}
</p>

</div>
))}

</div>

</div>

{/* SUPPORT STATS */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-20">

{stats.map((s,index)=>(

<div key={index}>

<p className="text-4xl font-bold text-primary-500">
{s.value}+
</p>

<p className={`text-dark-300 ${isNepali?'font-nepali':''}`}>
{isNepali ? s.label_ne : s.label_en}
</p>

</div>

))}

</div>

{/* KALIKAMAI MAP */}

<h2 className={`text-white text-2xl mb-6 ${isNepali?'font-nepali':''}`}>
{isNepali ? "कालिकामाई नक्सा" : "Kalikamai Map"}
</h2>

<div className="mb-10 rounded-lg overflow-hidden border border-red-900/40 bg-dark-900 p-4">

<iframe
width="100%"
height="350"
src="https://www.openstreetmap.org/export/embed.html?bbox=84.7131997346878%2C27.078648426701477%2C84.7182208299637%2C27.08170527074227&layer=mapnik"
style={{ border: "1px solid black" }}
/>

<div className="text-xs text-primary-500 mt-2">

<a
href="https://www.openstreetmap.org/?#map=18/27.080177/84.715710"
target="_blank"
rel="noopener noreferrer"
className="hover:text-white transition"
>
{isNepali ? "ठूलो नक्सा हेर्नुहोस्" : "View Larger Map"}
</a>

</div>

</div>

</motion.div>

</div>

</div>

);
}