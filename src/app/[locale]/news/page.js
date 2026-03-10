'use client'
import { motion } from "framer-motion"

const newsVideos = [
{
category:"SOCIAL WORK",

title_en:"Milk Distribution During Chhath Puja",
title_ne:"छठ पर्वमा गाउँमा दूध वितरण",

desc_en:"Milk was distributed in the village during the Chhath festival as a social service activity.",
desc_ne:"छठ पर्वको अवसरमा गाउँमा दूध वितरण गरिएको सामाजिक सेवा कार्य।",

embed:"https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1365431741808550%2F&show_text=false&width=560&t=0",
link:"https://www.facebook.com/reel/1365431741808550/"
},

{
category:"CAMPAIGN",

title_en:"Campaign Supporting Tek Bahadur",
title_ne:"टेक बहादुर जिताउ अभियान",

desc_en:"Campaign supporting Tek Bahadur Shakya, candidate from Parsa constituency 4.",
desc_ne:"पर्सा जिल्ला क्षेत्र नम्बर ४ का उम्मेदवार टेक बहादुर शाक्यलाई समर्थन गर्दै अभियान।",

embed:"https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1168367842041194%2F&show_text=false&width=560&t=0",
link:"https://www.facebook.com/reel/1168367842041194/"
},

{
category:"ANTI CORRUPTION",

title_en:"Voice Against Corruption in Gaupalika",
title_ne:"गाउँपालिकामा भ्रष्टाचार विरुद्ध आवाज",

desc_en:"Rajnish Kushwaha raising his voice against corruption in Kalikamai Gaupalika.",
desc_ne:"कालिकामाई गाउँपालिकामा भएको भ्रष्टाचार विरुद्ध राजनीश कुशवाहाले आवाज उठाउँदै।",

embed:"https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1311742154339581%2F&show_text=false&width=560&t=0",
link:"https://www.facebook.com/reel/1311742154339581/"
},

{
category:"CAMPAIGN",

title_en:"Support for Tek Bahadur Shakya",
title_ne:"टेक बहादुर शाक्यलाई समर्थन",

desc_en:"Gen-Z youth leader Rajnish Kushwaha explaining why he supports Tek Bahadur Shakya.",
desc_ne:"पर्सा जिल्ला क्षेत्र नम्बर ४ रासपाका उम्मेदवार टेक बहादुर शाक्य लाई जेनजी युवा राजनिश कुशवाहा को पुरा समर्थन किन।",

embed:"https://www.facebook.com/plugins/video.php?height=420&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F761243620051410%2F&show_text=false&width=560&t=0",
link:"https://www.facebook.com/reel/761243620051410/"
},

{
category:"VISION",

title_en:"Vision for Transparent Kalikamai",
title_ne:"पारदर्शी र भ्रष्टाचारमुक्त कालिकामाई",

desc_en:"Rajnish Kushwaha's vision to make Kalikamai transparent, corruption-free and youth-friendly.",
desc_ne:"कालिकामाईलाई पारदर्शी, भ्रष्टाचारमुक्त र युवामैत्री बनाउनु मेरो पहिलो लक्ष्य हो।",

embed:"https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1650112329340076%2F&show_text=false&width=375&t=0",
link:"https://www.facebook.com/reel/1650112329340076/"
}
]

export default function NewsPage({ params:{ locale }}){

const isNepali = locale === 'ne'

return(

<div className="min-h-screen bg-dark-950 pt-24 pb-20">

<div className="container-custom">

<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.7}}
>

<div className="text-primary-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">
{isNepali ? "समाचार" : "News"}
</div>

<h1 className={`text-white mb-6 ${isNepali ? 'font-nepali text-4xl font-black':'font-display text-7xl uppercase tracking-tight'}`}>
{isNepali ? "समाचार" : "Latest News"}
</h1>

<div className="w-16 h-0.5 bg-primary-700 mb-12"/>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

{newsVideos.map((video,index)=>(

<motion.div
key={index}
initial={{opacity:0,y:50,scale:0.95}}
whileInView={{opacity:1,y:0,scale:1}}
viewport={{once:true}}
transition={{delay:index*0.15}}
className="group bg-dark-900 border border-red-900/40 rounded-xl p-4 hover:border-primary-600 hover:shadow-xl hover:shadow-red-900/20 transition-all duration-300 hover:-translate-y-1"
>

{/* VIDEO CONTAINER */}

<div className="relative w-full aspect-video rounded-lg overflow-hidden">

<iframe
src={video.embed}
className="absolute top-0 left-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
frameBorder="0"
allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
allowFullScreen
/>

</div>

{/* CATEGORY */}

<span className="inline-block text-xs bg-primary-700 text-white px-2 py-1 rounded mt-4">
{video.category}
</span>

{/* TITLE */}

<h3 className={`text-white font-bold mt-3 ${isNepali ? 'font-nepali':''}`}>
{isNepali ? video.title_ne : video.title_en}
</h3>

{/* DESCRIPTION */}

<p className={`text-dark-400 text-sm mt-2 ${isNepali ? 'font-nepali':''}`}>
{isNepali ? video.desc_ne : video.desc_en}
</p>

{/* FOOTER */}

<div className="flex justify-between items-center mt-3">

<p className="text-primary-500 text-xs">
{isNepali ? "स्रोत: फेसबुक" : "Source: Facebook"}
</p>

<a
href={video.link}
target="_blank"
rel="noopener noreferrer"
className="text-xs text-primary-500 hover:text-white transition"
>
{isNepali ? "फेसबुकमा हेर्नुहोस् →" : "Watch →"}
</a>

</div>

</motion.div>

))}

</div>

</motion.div>

</div>

</div>

)
}