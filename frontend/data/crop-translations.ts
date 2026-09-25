export interface CropDiseaseAdvisory {
  cropName: string
  diseaseName: string
  localName: Record<string, string>
  whatHappened: Record<string, string>
  howToReduce: Record<string, string>
  chemicalControl: Record<string, string>
  biologicalControl: Record<string, string>
  precautions: Record<string, string[]>
  audioScript: Record<string, string>
}

export const CROP_ADVISORIES: Record<string, CropDiseaseAdvisory> = {
  Tomato: {
    cropName: 'Tomato',
    diseaseName: 'Early Blight (Alternaria solani)',
    localName: {
      en: 'Tomato - Early Blight',
      hi: 'टमाटर - अगेती झुलसा (अर्ली ब्लाइट)',
      mr: 'टोमॅटो - करपा रोग (अगेती करपा)',
      pa: 'ਟਮਾਟਰ - ਅਗੇਤੀ ਝੁਲਸਾ',
    },
    whatHappened: {
      en: 'The Alternaria solani fungal spores penetrated through leaf stomata during recent warm, humid conditions. Dark concentric rings (bullseye target spots) with yellow halos formed on older lower leaves, disrupting photosynthesis.',
      hi: 'हाल की अधिक नमी और गर्मी के कारण अल्टरनेरिया फफूंद के जीवाणु पत्तियों के छिद्रों से अंदर प्रवेश कर गए। निचली पुरानी पत्तियों पर कत्थई रंग के गोल छल्ले (टारगेट बोर्ड जैसे धब्बे) बन गए हैं, जिससे पौधे की प्रकाश संश्लेषण क्षमता घट रही है।',
      mr: 'वातावरणातील जास्त आर्द्रता आणि उष्णतेमुळे अल्टरनेरिया बुरशीचे बीजाणू पानांमध्ये शिरले आहेत. खालील जुन्या पानांवर गोलाकार वलय असलेले तपकिरी ठिपके पडले असून झाडाची अन्ननिर्मिती मंदावली आहे.',
      pa: 'ਵੱਧ ਨਮੀ ਅਤੇ ਗਰਮੀ ਕਾਰਨ ਉੱਲੀ ਦੇ ਰੋਗਾਣੂ ਪੱਤਿਆਂ ਵਿੱਚ ਦਾਖਲ ਹੋ ਗਏ ਹਨ। ਹੇਠਲੇ ਪੱਤਿਆਂ ਤੇ ਗੋਲ ਧੱਬੇ ਬਣ ਗਏ ਹਨ।',
    },
    howToReduce: {
      en: '1. Rogue and bury lower infected leaves touching moist soil. 2. Spray Chlorothalonil 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L in the evening. 3. Switch to root-zone drip irrigation to keep canopy dry.',
      hi: '1. जमीन को छूने वाली संक्रमित निचली पत्तियों को तुरंत काटकर खेत से दूर नष्ट करें। 2. शाम के समय क्लोरोथैलोनिल 75% WP (2 ग्राम/लीटर) या अज़ोक्सीस्ट्रोबिन 23% SC (1 मिली/लीटर) का छिड़काव करें। 3. फव्वारा सिंचाई बंद कर ड्रिप द्वारा जड़ों में पानी दें।',
      mr: '1. मातीला टेकलेली प्रादुर्भावग्रस्त पाने खुडून शेताबाहेर नष्ट करा. 2. संध्याकाळी क्लोरोथॅलोनिल 75% WP (2 ग्रॅम/लिटर) किंवा अझोक्सीस्ट्रोबिन (1 मिली/लिटर) फवारा. 3. ठिबक सिंचनाने पाणी द्या जेणेकरून पाने सुकी राहतील.',
      pa: '1. ਖਰਾਬ ਪੱਤੇ ਤੋੜ ਕੇ ਨਸ਼ਟ ਕਰੋ। 2. ਸ਼ਾਮ ਨੂੰ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਉੱਲੀਨਾਸ਼ਕ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰੋ। 3. ਤੁਪਕਾ ਸਿੰਚਾਈ ਅਪਣਾਓ।',
    },
    chemicalControl: {
      en: 'Chlorothalonil 75% WP @ 2 g/L or Copper Oxychloride 50% WP @ 3 g/L',
      hi: 'क्लोरोथैलोनिल 75% WP (2 ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड 50% WP (3 ग्राम/लीटर)',
      mr: 'क्लोरोथॅलोनिल 75% WP (2 ग्रॅम/लिटर) किंवा कॉपर ऑक्सिक्लोराईड (3 ग्रॅम/लिटर)',
      pa: 'ਕਲੋਰੋਥੈਲੋਨਿਲ 75% WP (2 ਗ੍ਰਾਮ/ਲਿਟਰ)',
    },
    biologicalControl: {
      en: '5% Neem Seed Kernel Extract (NSKE) or Trichoderma viride foliar spray @ 5 g/L',
      hi: '5% नीम के बीज का अर्क (NSKE) या ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर पानी)',
      mr: '5% निंबोळी अर्क किंवा ट्रायकोडर्मा व्हिरिडी (5 ग्रॅम/लिटर पाणी)',
      pa: '5% ਨਿੰਮ ਦਾ ਅਰਕ ਜਾਂ ਟ੍ਰਾਈਕੋਡਰਮਾ',
    },
    precautions: {
      en: [
        'Avoid overhead sprinkler irrigation; keep foliar canopy completely dry.',
        'Stake tomato vines with twine/bamboo to elevate foliage 30 cm above soil.',
        'Sanitize pruning clippers in 1% sodium hypochlorite between rows.',
      ],
      hi: [
        'ऊपर से फव्वारा सिंचाई न करें; पत्तियों को सूखा रखना अत्यंत आवश्यक है।',
        'टमाटर के पौधों को बांस व सुतली से सहारा देकर जमीन से 30 सेमी ऊपर रखें।',
        'कटाई-छंटाई के औजारों को डेटॉल या सैनिटाइज़र से साफ करके ही इस्तेमाल करें।',
      ],
      mr: [
        'तुषार सिंचन टाळा; झाडांची पाने ओली राहू देऊ नका.',
        'टोमॅटोच्या झाडांना बांबू व दोरीच्या साहाय्याने जमिनीपासून 30 सेंमी वर बांधा.',
        'छाटणीची अवजारे जंतुनाशकाने स्वच्छ करून मगच वापरा.',
      ],
      pa: [
        'ਫੁਹਾਰਾ ਸਿੰਚਾਈ ਨਾ ਕਰੋ, ਪੱਤੇ ਸੁੱਕੇ ਰੱਖੋ।',
        'ਬੂਟਿਆਂ ਨੂੰ ਜ਼ਮੀਨ ਤੋਂ ਉੱਪਰ ਰੱਖਣ ਲਈ ਸਹਾਰਾ ਦਿਓ।',
        'ਔਜ਼ਾਰਾਂ ਦੀ ਸਫਾਈ ਰੱਖੋ।',
      ],
    },
    audioScript: {
      en: 'Namaste Kisan friend. In your tomato crop, Early Blight fungus has infected the lower leaves due to humidity. Please prune diseased lower leaves immediately, spray Chlorothalonil @ 2g per liter in the evening, and water only at the roots.',
      hi: 'नमस्ते किसान भाई। आपके टमाटर की फसल में नमी के कारण अगेती झुलसा फफूंद का असर हुआ है। कृपया जमीन से सटी रोगी पत्तियों को तोड़कर नष्ट करें, शाम को 2 ग्राम प्रति लीटर क्लोरोथैलोनिल का छिड़काव करें और पानी केवल जड़ों में दें।',
      mr: 'नमस्कार शेतकरी मित्र. तुमच्या टोमॅटो पिकात जास्त आर्द्रतेमुळे अगेती करपा बुरशीचा प्रादुर्भाव झाला आहे. मातीला लागलेली खराब पाने तोडून टाका आणि संध्याकाळी क्लोरोथॅलोनिल 2 ग्रॅम प्रति लिटर फवारा.',
      pa: 'ਨਮਸਤੇ ਕਿਸਾਨ ਵੀਰੋ। ਤੁਹਾਡੇ ਟਮਾਟਰ ਦੀ ਫਸਲ ਵਿੱਚ ਅਗੇਤੀ ਝੁਲਸਾ ਦਾ ਹਮਲਾ ਹੋਇਆ ਹੈ। ਖਰਾਬ ਪੱਤੇ ਹਟਾਓ ਅਤੇ ਸ਼ਾਮ ਨੂੰ ਉੱਲੀਨਾਸ਼ਕ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
  },

  Potato: {
    cropName: 'Potato',
    diseaseName: 'Late Blight (Phytophthora infestans)',
    localName: {
      en: 'Potato - Late Blight',
      hi: 'आलू - पछेती झुलसा (लेट ब्लाइट)',
      mr: 'बटाटा - उशिरा येणारा करपा (लेट ब्लाईट)',
      pa: 'ਆਲੂ - ਪਛੇਤੀ ਝੁਲਸਾ',
    },
    whatHappened: {
      en: 'Phytophthora infestans oospores germinated in cool, foggy weather with night dew. Water-soaked dark lesions rapidly formed at leaf margins with white fungal down on the leaf underside, risking tuber rot.',
      hi: 'ठंडे व कोहरे वाले मौसम और रात की ओस के कारण फाइटोफ्थोरा फफूंद के बीजाणु अंकुरित हो गए। पत्तियों के किनारों पर काले पानीदार धब्बे फैल रहे हैं और पत्ती के पीछे सफेद फफूंद दिख रही है जो कंदों तक पहुंच सकती है।',
      mr: 'थंड व ढगाळ हवामान आणि दवामुळे फायटोफ्थोरा बुरशीचा प्रसार झाला आहे. पानांच्या कडांवर काळे डाग पडले असून पानांच्या मागच्या बाजूस पांढरी बुरशी वाढली आहे.',
      pa: 'ਠੰਡੇ ਅਤੇ ਧੁੰਦਲੇ ਮੌਸਮ ਕਾਰਨ ਉੱਲੀ ਫੈਲ ਗਈ ਹੈ। ਪੱਤਿਆਂ ਦੇ ਕਿਨਾਰਿਆਂ ਤੇ ਕਾਲੇ ਧੱਬੇ ਬਣ ਗਏ ਹਨ।',
    },
    howToReduce: {
      en: '1. Emergency foliar spray: Cymoxanil 8% + Mancozeb 64% WP (Curzate) @ 2.5 g/L. 2. Earth up potato ridges to prevent spores washing into tubers. 3. Cut off haulms 10 days before harvest.',
      hi: '1. आपातकालीन छिड़काव: साइमोक्सानिल 8% + मैंकोजेब 64% WP (कर्ज़ेट) @ 2.5 ग्राम/लीटर तुरंत करें। 2. पौधों की जड़ों पर मिट्टी चढ़ाएं ताकि जीवाणु आलू के कंदों तक न पहुंचें। 3. खुदाई से 10 दिन पहले पौधों की बेल काट दें।',
      mr: '1. तातडीने सायमॉक्सॅनिल + मॅनकोझेब (2.5 ग्रॅम/लिटर) फवारा. 2. बटाट्याच्या झाडांना मातीची भर लावा जेणेकरून बुरशी कंदांपर्यंत जाणार नाही. 3. काढणीपूर्वी 10 दिवस झाडांचे शेंडे कापा.',
      pa: '1. ਤੁਰੰਤ ਮੈਨਕੋਜ਼ੇਬ ਦਾ ਛਿੜਕਾਅ ਕਰੋ। 2. ਬੂਟਿਆਂ ਨੂੰ ਮਿੱਟੀ ਚੜ੍ਹਾਓ।',
    },
    chemicalControl: {
      en: 'Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L or Dimethomorph 50% WP @ 1 g/L',
      hi: 'साइमोक्सानिल 8% + मैंकोजेब 64% WP @ 2.5 ग्राम/लीटर या डाइमेथोमॉर्फ 50% WP @ 1 ग्राम/लीटर',
      mr: 'सायमॉक्सॅनिल + मॅनकोझेब @ 2.5 ग्रॅम/लिटर किंवा डायमेथोमॉर्फ @ 1 ग्रॅम/लिटर',
      pa: 'ਸਾਈਮੋਕਸਾਨਿਲ + ਮੈਨਕੋਜ਼ੇਬ @ 2.5 ਗ੍ਰਾਮ/ਲਿਟਰ',
    },
    biologicalControl: {
      en: 'Trichoderma viride tuber treatment + Copper hydroxide foliar protective film',
      hi: 'ट्राइकोडर्मा विरिडी बीज उपचार + कॉपर हाइड्रॉक्साइड का सुरक्षात्मक लेप',
      mr: 'ट्रायकोडर्मा व्हिरिडी बीजप्रक्रिया + कॉपर हायड्रॉक्साईड संरक्षक फवारणी',
      pa: 'ਟ੍ਰਾਈਕੋਡਰਮਾ ਬੀਜ ਉਪਚਾਰ',
    },
    precautions: {
      en: [
        'Never irrigate potato crop during overcast, foggy morning hours.',
        'Burn or deeply bury infected haulms away from field borders.',
        'Use certified disease-free seed tubers for the next sowing cycle.',
      ],
      hi: [
        'कोहरे या बादल वाले दिनों में सुबह सिंचाई बिल्कुल न करें।',
        'संक्रमित पौधों के अवशेषों को खेत की मेड़ों पर न छोड़ें, उन्हें गहरे गड्ढे में दबाएं।',
        'अगले मौसम में केवल प्रमाणित और उपचारित आलू बीजों का ही उपयोग करें।',
      ],
      mr: [
        'ढगाळ आणि धुक्याच्या वातावरणात पाणी देणे टाळा.',
        'रोगट झाडांचे अवशेष शेताबाहेर खड्ड्यात गाडून नष्ट करा.',
        'पुढील हंगामासाठी प्रमाणित बियाणेच वापरा.',
      ],
      pa: [
        'ਧੁੰਦਲੇ ਮੌਸਮ ਵਿੱਚ ਪਾਣੀ ਨਾ ਲਗਾਓ।',
        'ਬਿਮਾਰੀ ਵਾਲੇ ਪੌਦਿਆਂ ਨੂੰ ਨਸ਼ਟ ਕਰੋ।',
      ],
    },
    audioScript: {
      en: 'Attention Kisan brother! Late blight detected in your potato crop. This spreads very quickly in cold, humid weather. Spray Cymoxanil plus Mancozeb @ 2.5g per liter immediately and earth up the ridges to protect developing tubers.',
      hi: 'ध्यान दें किसान भाई! आपके आलू में पछेती झुलसा बीमारी लगी है। ठंडे और नम मौसम में यह बहुत तेजी से फैलती है। तुरंत साइमोक्सानिल और मैंकोजेब @ 2.5 ग्राम प्रति लीटर का छिड़काव करें और आलू के कंदों पर मिट्टी चढ़ाएं।',
      mr: 'लक्ष द्या शेतकरी मित्र! बटाट्यावर लेट ब्लाईटचा प्रादुर्भाव झाला आहे. थंड हवेत हा रोग झपाट्याने पसरतो. लगेच सायमॉक्सॅनिल अधिक मॅनकोझेब 2.5 ग्रॅम प्रति लिटर फवारा आणि झाडांना मातीची भर लावा.',
      pa: 'ਕਿਸਾਨ ਵੀਰੋ ਧਿਆਨ ਦਿਓ! ਆਲੂ ਦੀ ਫਸਲ ਵਿੱਚ ਪਛੇਤੀ ਝੁਲਸਾ ਦਾ ਖਤਰਾ ਹੈ। ਤੁਰੰਤ ਮੈਨਕੋਜ਼ੇਬ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
  },

  Corn: {
    cropName: 'Corn',
    diseaseName: 'Common Rust (Puccinia sorghi)',
    localName: {
      en: 'Corn - Common Rust',
      hi: 'मक्का - सामान्य रतुआ (कॉमन रस्ट)',
      mr: 'मका - तांबेरा रोग (रस्ट)',
      pa: 'ਮੱਕੀ - ਕੁੰਗੀ ਰੋਗ',
    },
    whatHappened: {
      en: 'Puccinia sorghi fungal urediniospores carried by wind settled on corn leaf blades. High atmospheric moisture caused reddish-brown powdery pustules to erupt on both leaf surfaces, stealing plant sugars.',
      hi: 'हवा द्वारा लाए गए पक्सीनिया सोरघाई फफूंद के बीजाणु मक्के की पत्तियों पर जम गए। हवा में नमी के कारण पत्ती की दोनों सतहों पर कत्थई-लाल रंग के फफोले (रतुआ के दाने) फूट पड़े हैं, जिससे भुट्टे कमजोर हो सकते हैं।',
      mr: 'वाऱ्यामार्फत आलेले पुक्सिनिया बुरशीचे बीजाणू मक्याच्या पानांवर रुजले आहेत. पानांच्या दोन्ही बाजूंवर तांबूस तपकिरी रंगाचे फोड आले असून पिकाची वाढ खुंटत आहे.',
      pa: 'ਹਵਾ ਰਾਹੀਂ ਆਏ ਉੱਲੀ ਦੇ ਰੋਗਾਣੂ ਪੱਤਿਆਂ ਤੇ ਜੰਮ ਗਏ ਹਨ, ਜਿਸ ਨਾਲ ਲਾਲ-ਭੂਰੇ ਫੋੜੇ ਬਣ ਗਏ ਹਨ।',
    },
    howToReduce: {
      en: '1. Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 23% SC @ 1 ml/L. 2. Remove infected volunteer corn plants. 3. Ensure balanced potassium fertilization to strengthen leaf cell walls.',
      hi: '1. मैंकोजेब 75% WP @ 2.5 ग्राम/लीटर या अज़ोक्सीस्ट्रोबिन @ 1 मिली/लीटर का छिड़काव करें। 2. खेत के आसपास उगे जंगली व पुराने मक्के के पौधों को नष्ट करें। 3. पोटाश खाद का संतुलित उपयोग करें।',
      mr: '1. मॅनकोझेब 75% WP (2.5 ग्रॅम/लिटर) किंवा अझोक्सीस्ट्रोबिन (1 मिली/लिटर) फवारा. 2. जुनी रोगट झाडे उपटून नष्ट करा. 3. पालाश खताचा वापर वाढवा.',
      pa: '1. ਮੈਨਕੋਜ਼ੇਬ @ 2.5 ਗ੍ਰਾਮ/ਲਿਟਰ ਦਾ ਛਿੜਕਾਅ ਕਰੋ। 2. ਖੇਤ ਸਾਫ ਰੱਖੋ।',
    },
    chemicalControl: {
      en: 'Mancozeb 75% WP @ 2.5 g/L or Propiconazole 25% EC @ 1 ml/L',
      hi: 'मैंकोजेब 75% WP @ 2.5 ग्राम/लीटर या प्रोपिकोनाज़ोल 25% EC @ 1 मिली/लीटर',
      mr: 'मॅनकोझेब 75% WP @ 2.5 ग्रॅम/लिटर किंवा प्रोपिकोनाझोल @ 1 मिली/लिटर',
      pa: 'ਮੈਨਕੋਜ਼ੇਬ ਜਾਂ ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
    biologicalControl: {
      en: 'Foliar application of Trichoderma harzianum @ 5 g/L + Cow urine spray (10%)',
      hi: 'ट्राइकोडर्मा हरज़ियानम @ 5 ग्राम/लीटर या 10% गोमूत्र का पर्णीय छिड़काव',
      mr: 'ट्रायकोडर्मा हार्झियानम @ 5 ग्रॅम/लिटर किंवा 10% गोमूत्र फवारणी',
      pa: 'ਟ੍ਰਾਈਕੋਡਰਮਾ ਜਾਂ ਗਊ ਮੂਤਰ ਦਾ ਛਿੜਕਾਅ',
    },
    precautions: {
      en: [
        'Avoid late-season planting in rust-prone river belt regions.',
        'Maintain 60 cm row-to-row spacing for maximum air circulation.',
        'Do not apply excessive nitrogen which produces soft, vulnerable leaf tissue.',
      ],
      hi: [
        'रतुआ प्रभावित क्षेत्रों में देर से बुवाई करने से बचें।',
        'पंक्तियों के बीच 60 सेमी की दूरी रखें ताकि हवा का आवागमन बना रहे।',
        'यूरिया (नाइट्रोजन) का अत्यधिक प्रयोग न करें जिससे पत्तियां कोमल न हों।',
      ],
      mr: [
        'उशिरा पेरणी करणे टाळा.',
        'दोन ओळींमध्ये 60 सेंमी अंतर ठेवा जेणेकरून हवा खेळती राहील.',
        'युरियाचा अतिरेक टाळा.',
      ],
      pa: [
        'ਪਿਛੇਤੀ ਬਿਜਾਈ ਨਾ ਕਰੋ।',
        'ਬੂਟਿਆਂ ਵਿੱਚ ਸਹੀ ਦੂਰੀ ਰੱਖੋ।',
      ],
    },
    audioScript: {
      en: 'Kisan brother, Common Rust detected on your corn foliage. Small powdery cinnamon spots are visible. Please spray Mancozeb @ 2.5g per liter or Propiconazole @ 1ml per liter to stop spore propagation before silking.',
      hi: 'किसान भाई, आपके मक्के में रतुआ रोग के लक्षण मिले हैं। पत्तियों पर कत्थई रंग के पाउडर वाले दाने दिख रहे हैं। भुट्टे निकलने से पहले फफूंद रोकने के लिए मैंकोजेब 2.5 ग्राम या प्रोपिकोनाज़ोल 1 मिली प्रति लीटर का छिड़काव करें।',
      mr: 'शेतकरी मित्र, मक्याच्या पानांवर तांबेरा रोगाचे ठिपके आढळले आहेत. कणसे भरण्यापूर्वी मॅनकोझेब 2.5 ग्रॅम किंवा प्रोपिकोनाझोल 1 मिली प्रति लिटर फवारा.',
      pa: 'ਕਿਸਾਨ ਵੀਰੋ, ਮੱਕੀ ਦੀ ਫਸਲ ਵਿੱਚ ਕੁੰਗੀ ਰੋਗ ਦੇ ਲੱਛਣ ਹਨ। ਸਮੇਂ ਸਿਰ ਉੱਲੀਨਾਸ਼ਕ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
  },

  Rice: {
    cropName: 'Rice',
    diseaseName: 'Blast (Magnaporthe oryzae)',
    localName: {
      en: 'Rice - Blast',
      hi: 'धान - झोंका रोग (ब्लास्ट)',
      mr: 'भात / धान - करपा रोग (ब्लास्ट)',
      pa: 'ਝੋਨਾ - ਧੌਣ ਮਰੋੜ / ਬਲਾਸਟ',
    },
    whatHappened: {
      en: 'Magnaporthe oryzae fungus attacked tender leaf blades during overcast, humid days with cool nights. Spindle-shaped eye lesions with grey centers and dark brown margins have formed, weakening leaf circulation.',
      hi: 'लगातार बादलों, रात की ठंडक और दिन की नमी के कारण मैगनापोर्थे फफूंद ने धान की कोमल पत्तियों पर हमला किया। पत्तियों पर आंख के आकार के (बीच में भूरे और किनारों पर गहरे कत्थई) धब्बे बन गए हैं।',
      mr: 'ढगाळ वातावरण आणि रात्रीच्या गारव्यामुळे मॅग्नापोर्थे बुरशीचा संसर्ग झाला आहे. पानांवर डोळ्याच्या आकाराचे लांबट करडे ठिपके तयार झाले आहेत.',
      pa: 'ਬੱਦਲਵਾਈ ਅਤੇ ਨਮੀ ਵਾਲੇ ਮੌਸਮ ਕਾਰਨ ਝੋਨੇ ਦੇ ਪੱਤਿਆਂ ਤੇ ਅੱਖ ਵਰਗੇ ਲੰਬੂਤਰੇ ਧੱਬੇ ਬਣ ਗਏ ਹਨ।',
    },
    howToReduce: {
      en: '1. Spray Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L. 2. Maintain 2-3 cm standing water in paddy fields. 3. Stop nitrogen top-dressing until lesions dry.',
      hi: '1. ट्राइसाइक्लाज़ोल 75% WP @ 0.6 ग्राम/लीटर (बाण) या आइसोप्रोपिलिन 40% EC @ 1.5 मिली/लीटर का छिड़काव करें। 2. खेत में 2-3 सेमी पानी का स्तर बनाए रखें। 3. यूरिया डालना तुरंत बंद करें।',
      mr: '1. ट्रायसायक्लॅझोल 75% WP (0.6 ग्रॅम/लिटर) किंवा आयसोप्रॉथिओलेन (1.5 मिली/लिटर) फवारा. 2. शेतात 2-3 सेंमी पाणी साठवून ठेवा. 3. युरिया खताचा वापर थांबवा.',
      pa: '1. ਟ੍ਰਾਈਸਾਈਕਲਾਜ਼ੋਲ 75% WP (0.6 ਗ੍ਰਾਮ/ਲਿਟਰ) ਦਾ ਛਿੜਕਾਅ ਕਰੋ। 2. ਯੂਰੀਆ ਬੰਦ ਕਰੋ।',
    },
    chemicalControl: {
      en: 'Tricyclazole 75% WP (Baan) @ 0.6 g/L or Kasugamycin 3% SL @ 2 ml/L',
      hi: 'ट्राइसाइक्लाज़ोल 75% WP @ 0.6 ग्राम/लीटर या कासुगामाइसिन 3% SL @ 2 मिली/लीटर',
      mr: 'ट्रायसायक्लॅझोल 75% WP @ 0.6 ग्रॅम/लिटर किंवा कासुगामायसिन @ 2 मिली/लिटर',
      pa: 'ਟ੍ਰਾਈਸਾਈਕਲਾਜ਼ੋਲ 75% WP @ 0.6 ਗ੍ਰਾਮ/ਲਿਟਰ',
    },
    biologicalControl: {
      en: 'Pseudomonas fluorescens foliar spray @ 5 g/L + Silica fertilizer application',
      hi: 'स्यूडोमोनास फ्लोरेसेंस @ 5 ग्राम/लीटर + सिलिका खाद का प्रयोग',
      mr: 'स्यूडोमोनस फ्लोरेसेन्स @ 5 ग्रॅम/लिटर + सिलिकॉन खताचा वापर',
      pa: 'ਸੂਡੋਮੋਨਾਸ ਫਲੋਰੋਸੈਂਸ ਦਾ ਛਿੜਕਾਅ',
    },
    precautions: {
      en: [
        'Split nitrogen into 3 smaller split doses rather than heavy single basals.',
        'Keep bunds free of weed grass hosts like Echinochloa.',
        'Never let the paddy field dry out into cracked soil during active blast weather.',
      ],
      hi: [
        'नाइट्रोजन (यूरिया) को एक साथ न डालकर 3 छोटी खुराकों में बांटकर दें।',
        'खेत की मेड़ों पर से सांवा और जंगली घास को पूरी तरह साफ करें।',
        'ब्लास्ट के मौसम में खेत को सूखने व दरारें पड़ने से बचाएं।',
      ],
      mr: [
        'युरिया खत एकदम न टाकता 3 हप्त्यांमध्ये विभागून द्या.',
        'बांधावरील गवत काढून टाका.',
        'रोग असताना शेतातील पाणी पूर्णपणे आटू देऊ नका.',
      ],
      pa: [
        'ਯੂਰੀਆ ਕਿਸ਼ਤਾਂ ਵਿੱਚ ਪਾਓ।',
        'ਵੱਟਾਂ ਸਾਫ ਰੱਖੋ।',
      ],
    },
    audioScript: {
      en: 'Kisan brother, Rice Blast detected in your paddy field. Spindle-shaped lesions are spreading. Spray Tricyclazole @ 0.6 grams per liter immediately, maintain 2 centimeters water level, and pause urea application.',
      hi: 'किसान भाई, आपके धान में झोंका (ब्लास्ट) रोग लगा है। पत्तियों पर नाव के आकार के धब्बे बढ़ रहे हैं। तुरंत ट्राइसाइक्लाज़ोल 0.6 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें, खेत में 2 सेमी पानी रखें और यूरिया न डालें।',
      mr: 'शेतकरी मित्र, तुमच्या भात पिकावर करपा (ब्लास्ट) रोगाचा प्रादुर्भाव झाला आहे. लगेच ट्रायसायक्लॅझोल 0.6 ग्रॅम प्रति लिटर फवारा आणि युरिया खत देणे बंद करा.',
      pa: 'ਕਿਸਾਨ ਵੀਰੋ, ਝੋਨੇ ਵਿੱਚ ਬਲਾਸਟ ਰੋਗ ਦਾ ਹਮਲਾ ਹੋਇਆ ਹੈ। ਤੁਰੰਤ ਟ੍ਰਾਈਸਾਈਕਲਾਜ਼ੋਲ ਦਾ ਛਿੜਕਾਅ ਕਰੋ ਅਤੇ ਯੂਰੀਆ ਬੰਦ ਕਰੋ।',
    },
  },

  Cotton: {
    cropName: 'Cotton',
    diseaseName: 'Bacterial Blight (Xanthomonas citri pv. malvacearum)',
    localName: {
      en: 'Cotton - Bacterial Blight',
      hi: 'कपास - जीवाणु अंगमारी / कोणीय पत्ती धब्बा',
      mr: 'कापूस - जिवाणू करपा (काळा कोपरा)',
      pa: 'ਕਪਾਹ - ਬੈਕਟੀਰੀਅਲ ਬਲਾਈਟ / ਕਾਲਾ ਧੱਬਾ',
    },
    whatHappened: {
      en: 'Xanthomonas bacteria entered through leaf stomata and insect feeding punctures following rainstorms. Dark angular water-soaked lesions bounded by leaf veins formed on foliage, threatening square shedding.',
      hi: 'बारिश और तेज हवाओं के बाद जैंथोमोनास जीवाणु पत्तियों के रंध्रों में प्रवेश कर गए। नसों से घिरे कोणीय पानीदार काले धब्बे बन गए हैं, जिससे फूल-कली और टिंडे गिरने का खतरा है।',
      mr: 'पावसाच्या पाण्यामुळे झँथोमोनस जिवाणूंचा संसर्ग झाला असून शिरांमधील जागेवर काळे कोनीय डाग पडले आहेत. यामुळे पाते गळण्याची शक्यता वाढते.',
      pa: 'ਮੀਂਹ ਤੋਂ ਬਾਅਦ ਜੀਵਾਣੂਆਂ ਦਾ ਹਮਲਾ ਹੋਇਆ ਹੈ। ਪੱਤਿਆਂ ਤੇ ਕਾਲੇ ਕੋਣਦਾਰ ਧੱਬੇ ਬਣ ਗਏ ਹਨ।',
    },
    howToReduce: {
      en: '1. Spray Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 100 mg/L. 2. Remove heavily blighted bolls and twigs. 3. Avoid night sprinkler irrigation.',
      hi: '1. कॉपर ऑक्सीक्लोराइड 50% WP (2.5 ग्राम/लीटर) + स्ट्रेप्टोसाइक्लिन (1 ग्राम प्रति 10 लीटर पानी) का छिड़काव करें। 2. अधिक खराब पत्तियों को तोड़कर नष्ट करें। 3. रात में पानी न लगाएं।',
      mr: '1. कॉपर ऑक्सिक्लोराईड (2.5 ग्रॅम/लिटर) अधिक स्ट्रेप्टोसायक्लिन (1 ग्रॅम प्रति 10 लिटर) एकत्र फवारा. 2. रोगट फांद्या तोडून टाका.',
      pa: '1. ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ + ਸਟ੍ਰੈਪਟੋਸਾਈਕਲਿਨ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
    chemicalControl: {
      en: 'Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 100 mg/L',
      hi: 'कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम/लीटर + स्ट्रेप्टोसाइक्लिन @ 100 मिलीग्राम/लीटर',
      mr: 'कॉपर ऑक्सिक्लोराईड @ 2.5 ग्रॅम/लिटर + स्ट्रेप्टोसायक्लिन @ 100 मिग्रॅ/लिटर',
      pa: 'ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ + ਸਟ੍ਰੈਪਟੋਸਾਈਕਲਿਨ',
    },
    biologicalControl: {
      en: 'Pseudomonas fluorescens @ 5 g/L foliar spray + Neem oil (10,000 ppm) @ 3 ml/L',
      hi: 'स्यूडोमोनास फ्लोरेसेंस @ 5 ग्राम/लीटर या नीम तेल 10,000 PPM @ 3 मिली/लीटर',
      mr: 'स्यूडोमोनस फ्लोरेसेन्स @ 5 ग्रॅम/लिटर किंवा निंबोळी तेल @ 3 मिली/लिटर',
      pa: 'ਸੂਡੋਮੋਨਾਸ ਜਾਂ ਨਿੰਮ ਦਾ ਤੇਲ',
    },
    precautions: {
      en: [
        'Avoid excessive urea top-dressing during humid periods.',
        'Sanitize spraying equipment between farm blocks.',
        'Eradicate alternative malvaceous weeds like Kanghi along field bunds.',
      ],
      hi: [
        'अधिक उमस वाले मौसम में यूरिया का ज्यादा छिड़काव न करें।',
        'छिड़काव यंत्रों को एक खेत से दूसरे खेत में ले जाने से पहले धो लें।',
        'मेड़ों पर उगे कंधी और जंगली पौधों को साफ करें।',
      ],
      mr: [
        'दमट हवेत जास्त युरिया खत देऊ नका.',
        'फवारणीचे पंप स्वच्छ धुवून वापरा.',
        'बांधावरील तण काढून टाका.',
      ],
      pa: [
        'ਯੂਰੀਆ ਦਾ ਸੰਤੁਲਿਤ ਉਪਯੋਗ ਕਰੋ।',
        'ਸਫਾਈ ਦਾ ਧਿਆਨ ਰੱਖੋ।',
      ],
    },
    audioScript: {
      en: 'Kisan brother, Bacterial Blight detected in your cotton field. Angular water-soaked spots are forming along veins. Spray Copper Oxychloride 2.5 grams with Streptocycline in the evening to protect squares and bolls.',
      hi: 'किसान भाई, आपकी कपास में जीवाणु अंगमारी (काला कोपरा) के लक्षण मिले हैं। नसों के बीच कोणीय काले धब्बे बन रहे हैं। टिंडों को बचाने के लिए कॉपर ऑक्सीक्लोराइड 2.5 ग्राम और स्ट्रेप्टोसाइक्लिन का शाम को छिड़काव करें।',
      mr: 'शेतकरी मित्र, कापसावर जिवाणू करपा रोगाचे कोनीय डाग आढळले आहेत. पाते व बोंडे वाचवण्यासाठी कॉपर ऑक्सिक्लोराईड अधिक स्ट्रेप्टोसायक्लिन लगेच फवारा.',
      pa: 'ਕਿਸਾਨ ਵੀਰੋ, ਕਪਾਹ ਵਿੱਚ ਬੈਕਟੀਰੀਅਲ ਬਲਾਈਟ ਦਾ ਹਮਲਾ ਹੋਇਆ ਹੈ। ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
  },

  Chilli: {
    cropName: 'Chilli',
    diseaseName: 'Bacterial Spot (Xanthomonas campestris)',
    localName: {
      en: 'Chilli - Bacterial Spot',
      hi: 'हरी मिर्च - जीवाणु पत्ती धब्बा (बैक्टीरियल स्पॉट)',
      mr: 'मिरची - जिवाणू ठिपके रोग',
      pa: 'ਹਰੀ ਮਿਰਚ - ਬੈਕਟੀਰੀਅਲ ਧੱਬਾ',
    },
    whatHappened: {
      en: 'Warm driving rain splashed Xanthomonas bacteria onto chilli foliage. Small, circular water-soaked dark spots with yellow chlorotic halos developed on leaves and fruit pedicels, triggering premature leaf drop.',
      hi: 'तेज बारिश और गर्म हवाओं के कारण जैंथोमोनास जीवाणु मिर्च की पत्तियों पर फैल गए। पत्तियों पर छोटे गोल कत्थई धब्बे और पीला घेरा बन गया है, जिससे फूल और पत्तियां झड़ रही हैं।',
      mr: 'पावसाच्या थेंबांमुळे जिवाणू पानांवर पसरले असून काळे गोलाकार ठिपके व पिवळी किनार तयार झाली आहे. यामुळे पाने व फुले गळतात.',
      pa: 'ਮੀਂਹ ਕਾਰਨ ਜੀਵਾਣੂਆਂ ਦਾ ਹਮਲਾ ਹੋਇਆ ਹੈ। ਪੱਤਿਆਂ ਤੇ ਛੋਟੇ ਕਾਲੇ ਧੱਬੇ ਬਣ ਰਹੇ ਹਨ।',
    },
    howToReduce: {
      en: '1. Spray Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 100 mg/L. 2. Remove and bury severely infected lower foliage. 3. Avoid working in fields when plants are wet.',
      hi: '1. कॉपर ऑक्सीक्लोराइड (2.5 ग्राम/लीटर) + स्ट्रेप्टोसाइक्लिन (1 ग्राम/10 लीटर पानी) का छिड़काव करें। 2. निचली रोगग्रस्त पत्तियों को तोड़कर गड्ढे में दबाएं। 3. गीले खेत में काम न करें।',
      mr: '1. कॉपर ऑक्सिक्लोराईड (2.5 ग्रॅम/लिटर) अधिक स्ट्रेप्टोसायक्लिन एकत्र फवारा. 2. रोगट पाने काढून टाका. 3. पाने ओली असताना शेतात काम करणे टाळा.',
      pa: '1. ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ + ਸਟ੍ਰੈਪਟੋਸਾਈਕਲਿਨ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
    chemicalControl: {
      en: 'Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 100 mg/L',
      hi: 'कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम/लीटर + स्ट्रेप्टोसाइक्लिन @ 100 मिलीग्राम/लीटर',
      mr: 'कॉपर ऑक्सिक्लोराईड 50% WP @ 2.5 ग्रॅम/लिटर + स्ट्रेप्टोसायक्लिन @ 100 मिग्रॅ/लिटर',
      pa: 'ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ + ਸਟ੍ਰੈਪਟੋਸਾਈਕਲਿਨ',
    },
    biologicalControl: {
      en: '5% Neem Seed Kernel Extract (NSKE) or Bacillus subtilis @ 5 g/L foliar spray',
      hi: '5% नीम बीज अर्क (NSKE) या बैसिलस सबटिलिस @ 5 ग्राम/लीटर छिड़काव',
      mr: '5% निंबोळी अर्क किंवा बॅसिलस सबटिलिस @ 5 ग्रॅम/लिटर फवारणी',
      pa: '5% ਨਿੰਮ ਦਾ ਅਰਕ',
    },
    precautions: {
      en: [
        'Never work in wet chilli fields to prevent splashing bacteria to healthy plants.',
        'Use disease-free nursery seedlings treated with Trichoderma.',
        'Maintain raised beds to ensure rapid rainwater drainage.',
      ],
      hi: [
        'जब पौधे गीले हों तब खेत में निराई-गुड़ाई न करें, इससे बीमारी फैलती है।',
        'स्वस्थ और ट्राइकोडर्मा से उपचारित पौध ही लगाएं।',
        'मेड़ों पर ऊंची क्यारियां बनाकर पानी की उचित निकासी रखें।',
      ],
      mr: [
        'पाने ओली असताना आंतरमशागत करू नका.',
        'गादीवाफ्यावर मिरचीची लागवड करा जेणेकरून पाण्याचा निचरा होईल.',
        'उपचारित रोपांचीच लागवड करा.',
      ],
      pa: [
        'ਗਿੱਲੇ ਖੇਤ ਵਿੱਚ ਕੰਮ ਨਾ ਕਰੋ।',
        'ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਦਾ ਪ੍ਰਬੰਧ ਰੱਖੋ।',
      ],
    },
    audioScript: {
      en: 'Kisan brother, Bacterial Spot detected on your chilli crop. Small dark spots with yellow halos are visible. Spray Copper Oxychloride with Streptocycline in the evening and avoid touching plants while leaves are wet.',
      hi: 'किसान भाई, आपकी मिर्च की फसल में जीवाणु पत्ती धब्बा रोग लगा है। पत्तियों पर पीले घेरे वाले काले धब्बे बन रहे हैं। शाम के समय कॉपर ऑक्सीक्लोराइड और स्ट्रेप्टोसाइक्लिन का छिड़काव करें और गीली पत्तियों को न छुएं।',
      mr: 'शेतकरी मित्र, मिरचीच्या पिकावर जिवाणू ठिपके रोगाचा प्रादुर्भाव झाला आहे. कॉपर ऑक्सिक्लोराईड आणि स्ट्रेप्टोसायक्लिनची संध्याकाळी फवारणी करा.',
      pa: 'ਕਿਸਾਨ ਵੀਰੋ, ਹਰੀ ਮਿਰਚ ਵਿੱਚ ਬੈਕਟੀਰੀਅਲ ਧੱਬਾ ਰੋਗ ਹੈ। ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
  },

  Grape: {
    cropName: 'Grape',
    diseaseName: 'Black Rot (Guignardia bidwellii)',
    localName: {
      en: 'Grape - Black Rot',
      hi: 'अंगूर - काला सड़न रोग (ब्लैक रॉट)',
      mr: 'द्राक्ष - काळी कुज (ब्लॅक रॉट)',
      pa: 'ਅੰਗੂਰ - ਕਾਲਾ ਗਲਣ ਰੋਗ',
    },
    whatHappened: {
      en: 'Guignardia bidwellii fungal ascospores released during spring rain showers infected young grape leaves and berry clusters. Circular reddish-brown necrotic spots with black fruiting pycnidia developed on leaves, threatening berry mummification.',
      hi: 'बारिश के कारण ग्विग्नार्डिया फफूंद के बीजाणु अंगूर की कोमल पत्तियों और गुच्छों पर फैल गए हैं। पत्तियों पर लाल-कत्थई रंग के गोल धब्बे और उनके अंदर छोटे काले दाने बन गए हैं जो अंगूरों को सुखाकर काला कर सकते हैं।',
      mr: 'पावसामुळे बुरशीचा प्रसार होऊन पानांवर तांबूस तपकिरी ठिपके आणि बारीक काळे ठिपके उमटले आहेत. यामुळे मण्यांवर काळे डाग पडून घड सुकण्याचा धोका असतो.',
      pa: 'ਮੀਂਹ ਕਾਰਨ ਉੱਲੀ ਦੇ ਰੋਗਾਣੂ ਅੰਗੂਰ ਦੇ ਗੁੱਛਿਆਂ ਤੇ ਫੈਲ ਗਏ ਹਨ।',
    },
    howToReduce: {
      en: '1. Spray Mancozeb 75% WP @ 2.5 g/L or Myclobutanil 10% WP @ 0.5 g/L. 2. Prune and destroy mummified berry clusters from prior season. 3. Train vine canopy for maximum air penetration.',
      hi: '1. मैंकोजेब 75% WP (2.5 ग्राम/लीटर) या माइक्लोबुटानिल 10% WP (0.5 ग्राम/लीटर) का छिड़काव करें। 2. पुराने सूखे काले अंगूरों के गुच्छों को तोड़कर जलाएं। 3. बेलों की छंटाई कर धूप व हवा का रास्ता बनाएं।',
      mr: '1. मॅनकोझेब 75% WP (2.5 ग्रॅम/लिटर) किंवा मायक्लोब्युटानिल (0.5 ग्रॅम/लिटर) फवारा. 2. जुने काळे सुकलेले घड तोडून जाळून टाका. 3. वेलींना योग्य सूर्यप्रकाश मिळेल अशी छाटणी करा.',
      pa: '1. ਮੈਨਕੋਜ਼ੇਬ ਦਾ ਛਿੜਕਾਅ ਕਰੋ। 2. ਪੁਰਾਣੇ ਸੁੱਕੇ ਗੁੱਛੇ ਨਸ਼ਟ ਕਰੋ।',
    },
    chemicalControl: {
      en: 'Mancozeb 75% WP @ 2.5 g/L or Difenoconazole 25% EC @ 0.5 ml/L',
      hi: 'मैंकोजेब 75% WP @ 2.5 ग्राम/लीटर या डाइफेनोकोनाज़ोल 25% EC @ 0.5 मिली/लीटर',
      mr: 'मॅनकोझेब 75% WP @ 2.5 ग्रॅम/लिटर किंवा डायफेनोकोनाझोल @ 0.5 मिली/लिटर',
      pa: 'ਮੈਨਕੋਜ਼ੇਬ @ 2.5 ਗ੍ਰਾਮ/ਲਿਟਰ',
    },
    biologicalControl: {
      en: 'Trichoderma viride vine spray @ 5 g/L + Bordeaux mixture (1%) preventive shield',
      hi: 'ट्राइकोडर्मा विरिडी @ 5 ग्राम/लीटर या 1% बोर्डो मिश्रण का सुरक्षात्मक छिड़काव',
      mr: 'ट्रायकोडर्मा व्हिरिडी @ 5 ग्रॅम/लिटर किंवा 1% बोर्डो मिश्रण फवारणी',
      pa: 'ਟ੍ਰਾਈਕੋਡਰਮਾ ਜਾਂ ਬੋਰਡੋ ਮਿਸ਼ਰਣ',
    },
    precautions: {
      en: [
        'Maintain proper canopy shoot positioning to maximize sunlight and airflow.',
        'Avoid overhead sprinkler irrigation during shoot elongation and berry set.',
        'Keep vineyard floor weed-free to lower microclimate humidity beneath vines.',
      ],
      hi: [
        'अंगूर की बेलों को इस प्रकार फैलाएं कि पत्तियों तक पूरी धूप और हवा पहुंचे।',
        'अंगूर बनने के समय ऊपर से फव्वारा सिंचाई न करें।',
        'बगीचे के नीचे से खरपतवार साफ रखें ताकि जमीन में नमी कम रहे।',
      ],
      mr: [
        'वेलींमध्ये हवा व सूर्यप्रकाश राहील अशी विरळणी ठेवा.',
        'मणी लागण्याच्या काळात तुषार सिंचन करू नका.',
        'वेलींच्या खाली तण वाढू देऊ नका.',
      ],
      pa: [
        'ਧੁੱਪ ਅਤੇ ਹਵਾ ਦਾ ਪ੍ਰਬੰਧ ਰੱਖੋ।',
        'ਫੁਹਾਰਾ ਸਿੰਚਾਈ ਨਾ ਕਰੋ।',
      ],
    },
    audioScript: {
      en: 'Namaste Kisan friend. Black Rot detected in your vineyard. Reddish-brown spots with dark margins are forming on leaves. Spray Mancozeb @ 2.5 grams per liter immediately and prune infected shoots to protect developing grape clusters.',
      hi: 'नमस्ते किसान भाई। आपके अंगूर के बाग में ब्लैक रॉट (काला सड़न) रोग लगा है। पत्तियों पर कत्थई रंग के गोल धब्बे बन रहे हैं। अंगूर के गुच्छों को बचाने के लिए तुरंत मैंकोजेब 2.5 ग्राम प्रति लीटर का छिड़काव करें और रोगी टहनियों को काटें।',
      mr: 'नमस्कार शेतकरी मित्र. तुमच्या द्राक्ष बागेत ब्लॅक रॉट बुरशीचा प्रादुर्भाव झाला आहे. मण्यांचे संरक्षण करण्यासाठी लगेच मॅनकोझेब 2.5 ग्रॅम प्रति लिटर फवारा आणि रोगट फांद्या छाटून टाका.',
      pa: 'ਕਿਸਾਨ ਵੀਰੋ, ਅੰਗੂਰ ਦੇ ਬਾਗ ਵਿੱਚ ਬਲੈਕ ਰੌਟ ਦਾ ਖਤਰਾ ਹੈ। ਤੁਰੰਤ ਮੈਨਕੋਜ਼ੇਬ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।',
    },
  },

  Sugarcane: {
    cropName: 'Sugarcane',
    diseaseName: 'Red Rot (Colletotrichum falcatum)',
    localName: {
      en: 'Sugarcane - Red Rot',
      hi: 'गन्ना - लाल सड़न रोग (रेड रॉट)',
      mr: 'ऊस - तांबडे कूज रोग (रेड रॉट)',
      pa: 'ਗੰਨਾ - ਰੱਤਾ ਰੋਗ / ਰੈੱਡ ਰੋਟ',
    },
    whatHappened: {
      en: 'Colletotrichum falcatum fungus entered through nodal root eyes or borer tunnels. The pathogen invaded the vascular bundles, causing leaf midribs to turn blood red and the inner cane stalk to ferment into sour-smelling alcohol.',
      hi: 'कोलेटोट्राइकम फफूंद जड़ों की गांठों व तना छेदक कीटों के छेदों से गन्ने के अंदर घुस गई है। पत्तियों की बीच वाली नसें खून जैसी लाल हो रही हैं और गन्ने के अंदर का गूदा लाल होकर खट्टी बदबू दे रहा है।',
      mr: 'कोलेटोट्रायकम बुरशी उसाच्या कांड्यांमध्ये शिरली आहे. पानाच्या मधल्या शिरेवर लाल चट्टे पडले असून उसाचा आतील भाग सडून आंबट वास येत आहे.',
      pa: 'ਉੱਲੀ ਗੰਨੇ ਦੇ ਤਣੇ ਅੰਦਰ ਦਾਖਲ ਹੋ ਗਈ ਹੈ, ਜਿਸ ਨਾਲ ਪੱਤਿਆਂ ਦੀਆਂ ਨਾੜਾਂ ਲਾਲ ਹੋ ਰਹੀਆਂ ਹਨ।',
    },
    howToReduce: {
      en: '1. Uproot and burn diseased clumps immediately with complete root system. 2. Dip setts in Carbendazim 50% WP @ 1 g/L prior to planting. 3. Apply Trichoderma viride @ 5 kg/acre with FYM.',
      hi: '1. रोगी गन्ने के पूरे झुंड को जड़ सहित उखाड़कर खेत से बाहर जलाएं। 2. बुवाई से पहले बीजों (टुकड़ों) को कार्बेन्डाजिम 1 ग्राम/लीटर के घोल में 15 मिनट डुबोएं। 3. गोबर की खाद के साथ ट्राइकोडर्मा (5 किलो/एकड़) जमीन में डालें।',
      mr: '1. रोगट उसाचे बुंधे मुळासकट उपटून जाळून टाका. 2. लागवडीपूर्वी बेणे कार्बेन्डाझिम (1 ग्रॅम/लिटर) द्रावणात 15 मिनिटे बुडवा. 3. शेणखतात ट्रायकोडर्मा मिसळून जमिनीत द्या.',
      pa: '1. ਰੋਗੀ ਬੂਟੇ ਜੜ੍ਹਾਂ ਸਮੇਤ ਪੁੱਟ ਕੇ ਸਾੜੋ। 2. ਬੀਜ ਉਪਚਾਰ ਜ਼ਰੂਰ ਕਰੋ।',
    },
    chemicalControl: {
      en: 'Carbendazim 50% WP sett dip @ 1 g/L or Thiophanate-Methyl 70% WP @ 1.5 g/L',
      hi: 'कार्बेन्डाजिम 50% WP बीज उपचार @ 1 ग्राम/लीटर या थायोफिनेट-मिथाइल @ 1.5 ग्राम/लीटर',
      mr: 'कार्बेन्डाझिम 50% WP @ 1 ग्रॅम/लिटर किंवा थायोफिनेट-मिथाईल @ 1.5 ग्रॅम/लिटर',
      pa: 'ਕਾਰਬੈਂਡਾਜ਼ਿਮ @ 1 ਗ੍ਰਾਮ/ਲਿਟਰ',
    },
    biologicalControl: {
      en: 'Trichoderma viride @ 5 kg/acre enriched in 500 kg Farmyard Manure',
      hi: 'ट्राइकोडर्मा विरिडी @ 5 किलोग्राम प्रति एकड़, 500 किलो गोबर की खाद में मिलाकर डालें',
      mr: 'ट्रायकोडर्मा व्हिरिडी @ 5 किलो प्रति एकर, शेणखतात मिसळून जमिनीत द्या',
      pa: 'ਟ੍ਰਾਈਕੋਡਰਮਾ ਰੂੜੀ ਦੀ ਖਾਦ ਵਿੱਚ ਮਿਲਾ ਕੇ ਪਾਓ',
    },
    precautions: {
      en: [
        'Never take a ratoon crop from a red-rot infected sugarcane field.',
        'Ensure rapid field surface drainage to avoid waterlogging during monsoon.',
        'Sterilize harvesting sickles with bleach solution between cane stools.',
      ],
      hi: [
        'रेड रॉट से प्रभावित खेत में पेड़ी (रतून) फसल कभी न लें।',
        'बरसात में खेत में पानी न भरने दें; जल निकासी की उचित व्यवस्था रखें।',
        'गन्ना काटने वाली दरांती को सैनिटाइज़र से साफ करते रहें।',
      ],
      mr: [
        'रोगट शेतात खोडवा पीक घेऊ नका.',
        'पावसाळ्यात शेतात पाणी साचू देऊ नका.',
        'तोडणीची कोयते निर्जंतुक करा.',
      ],
      pa: [
        'ਬਿਮਾਰੀ ਵਾਲੇ ਖੇਤ ਵਿੱਚ ਮੂਢੀ ਫਸਲ ਨਾ ਰੱਖੋ।',
        'ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਰੱਖੋ।',
      ],
    },
    audioScript: {
      en: 'Urgent Kisan friend! Red Rot detected in your sugarcane crop. This is a severe vascular infection. Uproot and burn diseased clumps immediately, avoid taking a ratoon crop, and treat setts with Carbendazim before replanting.',
      hi: 'अति आवश्यक सूचना किसान भाई! आपके गन्ने में लाल सड़न (रेड रॉट) रोग की पुष्टि हुई है। यह गंभीर रोग है। रोगग्रस्त गन्नों को तुरंत जड़ समेत उखाड़कर जला दें, पेड़ी फसल न लें और अगली बार बीज उपचार करके ही बोएं।',
      mr: 'अतिशय महत्त्वाची सूचना शेतकरी मित्र! उसावर तांबडे कूज (रेड रॉट) रोग आढळला आहे. रोगट उसाचे बुंधे लगेच उपटून जाळा, खोडवा घेऊ नका आणि पुढील लागवडीसाठी बेणेप्रक्रिया नक्की करा.',
      pa: 'ਕਿਸਾਨ ਵੀਰੋ, ਗੰਨੇ ਵਿੱਚ ਰੱਤਾ ਰੋਗ ਦਾ ਹਮਲਾ ਹੈ। ਬਿਮਾਰੀ ਵਾਲੇ ਬੂਟੇ ਸਾੜੋ ਅਤੇ ਮੂਢੀ ਫਸਲ ਨਾ ਰੱਖੋ।',
    },
  },
}
