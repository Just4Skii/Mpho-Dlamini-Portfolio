// 50-question minimal-pair listening bank
const LISTENING_BANK = [
  // ── TONE PAIRS ──
  {ctx:"Wǒ xiǎng ___ píngguǒ.",audio:"我想买苹果。",A:{h:"买",p:"mǎi (3rd)",e:"to buy"},B:{h:"卖",p:"mài (4th)",e:"to sell"},ans:0,tip:"mǎi (3) = buy ↘↗ | mài (4) = sell ↘"},
  {ctx:"Jīntiān tiānqì hěn ___.",audio:"今天天气很好。",A:{h:"好",p:"hǎo (3rd)",e:"good"},B:{h:"号",p:"hào (4th)",e:"number/date"},ans:0,tip:"hǎo (3) = good | hào (4) = date/number"},
  {ctx:"Wǒ bàba ___ lánqiú.",audio:"我爸爸打篮球。",A:{h:"大",p:"dà (4th)",e:"big"},B:{h:"打",p:"dǎ (3rd)",e:"to play/hit"},ans:1,tip:"dǎ (3) = play/hit | dà (4) = big"},
  {ctx:"Wǒ yào hē ___.",audio:"我要喝水。",A:{h:"水",p:"shuǐ (3rd)",e:"water"},B:{h:"睡",p:"shuì (4th)",e:"to sleep"},ans:0,tip:"shuǐ (3) = water | shuì (4) = sleep"},
  {ctx:"Wǒ ___ yǒu shū.",audio:"我也有书。",A:{h:"也",p:"yě (3rd)",e:"also/too"},B:{h:"要",p:"yào (4th)",e:"to want"},ans:0,tip:"yě (3) = also | yào (4) = want"},
  {ctx:"Tā ___ wǒ de lǎoshī.",audio:"她是我的老师。",A:{h:"是",p:"shì (4th)",e:"to be"},B:{h:"十",p:"shí (2nd)",e:"ten"},ans:0,tip:"shì (4) = to be | shí (2) = ten"},
  {ctx:"Wǒ xǐhuan ___.",audio:"我喜欢游泳。",A:{h:"游泳",p:"yóuyǒng",e:"swimming"},B:{h:"有用",p:"yǒuyòng",e:"useful"},ans:0,tip:"yóuyǒng = swim (2+3) | yǒuyòng = useful (3+4)"},
  {ctx:"Tā hěn ___.",audio:"她很好。",A:{h:"好",p:"hǎo (3rd)",e:"good"},B:{h:"号",p:"hào (4th)",e:"number"},ans:0,tip:"Context: she is GOOD, not a number"},
  {ctx:"Wǒ yǒu ___ gè píngguǒ.",audio:"我有三个苹果。",A:{h:"三",p:"sān (1st)",e:"three"},B:{h:"山",p:"shān (1st)",e:"mountain"},ans:0,tip:"sān = three | shān = mountain (listen for -n vs -n ending, same but different word)"},
  {ctx:"Wǒ ___ è le.",audio:"我也饿了。",A:{h:"也",p:"yě",e:"also"},B:{h:"有",p:"yǒu",e:"have"},ans:0,tip:"也 yě = also | 有 yǒu = have"},

  // ── -N vs -NG PAIRS ──
  {ctx:"___ nián kuài lè!",audio:"新年快乐！",A:{h:"新",p:"xīn (-n)",e:"new"},B:{h:"星",p:"xīng (-ng)",e:"star"},ans:0,tip:"xīn = new (tip of tongue touches teeth) | xīng = star (back of throat)"},
  {ctx:"Wǒ ___ nǐ.",audio:"我认识你。",A:{h:"认识",p:"rèn shi",e:"to know (a person)"},B:{h:"仍是",p:"réng shì",e:"still is"},ans:0,tip:"rèn (-n) = know | réng (-ng) = still"},
  {ctx:"___ diàn zài nǎr?",audio:"饭店在哪儿？",A:{h:"饭",p:"fàn (-n)",e:"meal/restaurant"},B:{h:"放",p:"fàng (-ng)",e:"to put/release"},ans:0,tip:"fàn (-n) = meal | fàng (-ng) = put — classic -n vs -ng pair"},
  {ctx:"Wǒ shì ___ guó rén.",audio:"我是中国人。",A:{h:"中",p:"zhōng (-ng)",e:"middle/China"},B:{h:"真",p:"zhēn (-n)",e:"really/true"},ans:0,tip:"zhōng (-ng) = middle | zhēn (-n) = really"},
  {ctx:"Wǒ ___ le.",audio:"我赢了。",A:{h:"赢",p:"yíng (-ng)",e:"to win"},B:{h:"音",p:"yīn (-n)",e:"sound"},ans:0,tip:"yíng (-ng) = win | yīn (-n) = sound"},
  {ctx:"Tā hěn ___.",audio:"他很能干。",A:{h:"能",p:"néng (-ng)",e:"capable/can"},B:{h:"嫩",p:"nèn (-n)",e:"tender"},ans:0,tip:"néng (-ng) = can | nèn (-n) = tender"},
  {ctx:"___ tiān wǒ qù běijīng.",audio:"明天我去北京。",A:{h:"明天",p:"míngtiān",e:"tomorrow"},B:{h:"明年",p:"míngnián",e:"next year"},ans:0,tip:"míngtiān = tomorrow | míngnián = next year (-tiān vs -nián)"},
  {ctx:"Wǒ ___ zhōngwén.",audio:"我学中文。",A:{h:"学",p:"xué",e:"to study"},B:{h:"说",p:"shuō",e:"to speak"},ans:0,tip:"学 xué = study | 说 shuō = speak"},

  // ── INITIAL CONSONANT PAIRS ──
  {ctx:"Qǐng ___ wǒ dú.",audio:"请跟我读。",A:{h:"跟",p:"gēn",e:"follow/with"},B:{h:"更",p:"gèng",e:"even more"},ans:0,tip:"gēn (1st tone) = follow | gèng (4th tone) = even more"},
  {ctx:"Tā qù ___ yuàn.",audio:"他去法院。",A:{h:"法院",p:"fǎyuàn",e:"court/law"},B:{h:"发言",p:"fāyán",e:"to speak/statement"},ans:0,tip:"fǎyuàn = court | fāyán = speech — 3+4 vs 1+2 tones"},
  {ctx:"___ bu qǐ.",audio:"对不起。",A:{h:"对",p:"duì",e:"correct/right"},B:{h:"队",p:"duì",e:"team/group"},ans:0,tip:"Both sound identical! 对不起 = sorry (set phrase)"},
  {ctx:"Wǒ xiǎng ___ rénmínbì.",audio:"我想换人民币。",A:{h:"换",p:"huàn",e:"to exchange"},B:{h:"还",p:"hái",e:"still/also"},ans:0,tip:"huàn = exchange | hái = still/also — different tones"},
  {ctx:"Tā ___ le.",audio:"他来了。",A:{h:"来",p:"lái (2nd)",e:"came/arrived"},B:{h:"赖",p:"lài (4th)",e:"lazy/blame"},ans:0,tip:"lái (2) = come/arrive | lài (4) = lazy"},
  {ctx:"___ miàn yǒu chāoshì.",audio:"前面有超市。",A:{h:"前面",p:"qiánmiàn",e:"in front"},B:{h:"后面",p:"hòumiàn",e:"behind"},ans:0,tip:"qián = front | hòu = back — listen for initial q vs h"},
  {ctx:"Wǒ hěn hǎo, bié ___.",audio:"我很好，别担心。",A:{h:"担心",p:"dān xīn",e:"to worry"},B:{h:"当心",p:"dāngxīn",e:"to be careful"},ans:0,tip:"dān xīn (-n ending) = worry | dāngxīn (-ng ending) = be careful"},

  // ── SIMILAR LOOKING/SOUNDING VOCAB ──
  {ctx:"Nǐ huì ___ ma?",audio:"你会游泳吗？",A:{h:"游泳",p:"yóuyǒng",e:"swimming"},B:{h:"有用",p:"yǒuyòng",e:"useful"},ans:0,tip:"游泳 yóuyǒng (2+3) = swim | 有用 yǒuyòng (3+4) = useful"},
  {ctx:"Tā shì ___ rén.",audio:"她是荷兰人。",A:{h:"河南",p:"Hénán",e:"Henan province"},B:{h:"荷兰",p:"Hélán",e:"Netherlands"},ans:1,tip:"Hénán (2+2) = Henan | Hélán (2+2) = Netherlands — different 2nd syllable"},
  {ctx:"Zhèlǐ hěn ___.",audio:"这里很静。",A:{h:"近",p:"jìn",e:"close/nearby"},B:{h:"静",p:"jìng",e:"quiet"},ans:1,tip:"jìn = near | jìng = quiet (-n vs -ng)"},
  {ctx:"Bàba ___ le.",audio:"爸爸下班了。",A:{h:"上班",p:"shàng bān",e:"start work"},B:{h:"下班",p:"xià bān",e:"finish work"},ans:1,tip:"shàng = up/start | xià = down/finish — context: bàba FINISHED work"},
  {ctx:"Gěi nǐ ___.",audio:"给你发票。",A:{h:"发表",p:"fābiǎo",e:"to publish"},B:{h:"发票",p:"fāpiào",e:"receipt/invoice"},ans:1,tip:"fābiǎo = publish | fāpiào = receipt — biǎo vs piào"},
  {ctx:"Māma yào mǎi ___.",audio:"妈妈要买桌子。",A:{h:"桌子",p:"zhuōzi",e:"table"},B:{h:"桌子",p:"zhuōzi",e:"table"},ans:0,tip:"zhuōzi = table | zhuō zi vs zhuó zi — listen to tone on second syllable"},
  {ctx:"Nǐ zài nǎge ___?",audio:"你在哪个年级？",A:{h:"年级",p:"niánjí",e:"grade/year (school)"},B:{h:"年纪",p:"niánjì",e:"age"},ans:0,tip:"niánjí (2+2) = school grade | niánjì (2+4) = age — different 2nd tone"},
  {ctx:"Tā ___ chídào.",audio:"他总是迟到。",A:{h:"总是",p:"zǒngshì",e:"always"},B:{h:"重视",p:"zhòngshì",e:"to value/emphasize"},ans:0,tip:"zǒngshì = always | zhòngshì = to value — z vs zh initial"},
  {ctx:"Wǒ xǐhuan ___ huār.",audio:"我喜欢画画儿。",A:{h:"画画儿",p:"huà huār",e:"to draw/paint"},B:{h:"花花儿",p:"huā huār",e:"flower pattern"},ans:0,tip:"huà (4th) = draw | huā (1st) = flower — tone 4 vs 1"},
  {ctx:"___ tóngzhì.",audio:"同志们好！",A:{h:"同志",p:"tóngzhì",e:"comrade"},B:{h:"同志",p:"tǒngzhì",e:"to govern/rule"},ans:0,tip:"tóngzhì (2+4) = comrade | tǒngzhì (3+4) = to govern — tone 2 vs 3"},

  // ── HSK 1 SPECIFIC PAIRS ──
  {ctx:"Wǒ ___ shū.",audio:"我有书。",A:{h:"有",p:"yǒu",e:"have"},B:{h:"又",p:"yòu",e:"again/also"},ans:0,tip:"yǒu (3rd) = have | yòu (4th) = again — tone 3 vs 4"},
  {ctx:"Tā ___ wǒ de péngyou.",audio:"她是我的朋友。",A:{h:"是",p:"shì",e:"is/am/are"},B:{h:"使",p:"shǐ",e:"to make/use"},ans:0,tip:"shì (4th) = is/am | shǐ (3rd) = to make — tone 4 vs 3"},
  {ctx:"___ shàngwǔ wǒ qù xuéxiào.",audio:"今天上午我去学校。",A:{h:"今天",p:"jīntiān",e:"today"},B:{h:"明天",p:"míngtiān",e:"tomorrow"},ans:0,tip:"jīn = today | míng = tomorrow — listen to first syllable"},
  {ctx:"Wǒ ___ chī miàntiáo.",audio:"我想吃面条。",A:{h:"想",p:"xiǎng",e:"want to"},B:{h:"能",p:"néng",e:"can/able to"},ans:0,tip:"xiǎng = want to | néng = can — different meaning/context"},
  {ctx:"Tā shì ___ ma?",audio:"她是学生吗？",A:{h:"老师",p:"lǎoshī",e:"teacher"},B:{h:"学生",p:"xuésheng",e:"student"},ans:1,tip:"lǎoshī = teacher | xuésheng = student — listen carefully"},
  {ctx:"Wǒ ___ Zhōngguó rén.",audio:"我不是中国人。",A:{h:"是",p:"shì",e:"am"},B:{h:"不是",p:"bú shì",e:"am not"},ans:1,tip:"shì = am | bú shì = am not — listen for 不 bù prefix"},
  {ctx:"Duōshao ___?",audio:"多少钱？",A:{h:"钱",p:"qián",e:"money"},B:{h:"年",p:"nián",e:"year"},ans:0,tip:"qián = money (q initial) | nián = year (n initial)"},
  {ctx:"___ kè le.",audio:"下课了。",A:{h:"上",p:"shàng",e:"start (class)"},B:{h:"下",p:"xià",e:"end (class)"},ans:1,tip:"shàng kè = class starts | xià kè = class ends — 上 vs 下"},
  {ctx:"Wǒ lái zì ___.",audio:"我来自南非。",A:{h:"南非",p:"Nánfēi",e:"South Africa"},B:{h:"南方",p:"Nánfāng",e:"South (direction)"},ans:0,tip:"Nánfēi = South Africa | Nánfāng = the South — fēi vs fāng"},
  {ctx:"Tā ___ hǎo.",audio:"他很好。",A:{h:"很",p:"hěn",e:"very"},B:{h:"恨",p:"hèn",e:"to hate"},ans:0,tip:"hěn (3rd) = very | hèn (4th) = to hate — tone 3 vs 4"},
  {ctx:"Wǒ hē ___.",audio:"我喝茶。",A:{h:"茶",p:"chá (2nd)",e:"tea"},B:{h:"差",p:"chà (4th)",e:"poor/bad"},ans:0,tip:"chá (2nd rising) = tea | chà (4th falling) = bad/poor"},
  {ctx:"Tā shì wǒ de ___.",audio:"她是我的姐姐。",A:{h:"姐姐",p:"jiějie",e:"older sister"},B:{h:"妹妹",p:"mèimei",e:"younger sister"},ans:0,tip:"jiě = older sister | mèi = younger sister — j vs m initial"},
  {ctx:"___ guānxi.",audio:"没关系。",A:{h:"没",p:"méi",e:"no/not have"},B:{h:"不",p:"bù",e:"not"},ans:0,tip:"没关系 méi guānxi = no problem | 不关系 is incorrect — 没 used with 有"},
  {ctx:"Wǒ qù ___ mǎi shuǐguǒ.",audio:"我去超市买水果。",A:{h:"超市",p:"chāoshì",e:"supermarket"},B:{h:"城市",p:"chéngshì",e:"city"},ans:0,tip:"chāoshì = supermarket | chéngshì = city — chāo vs chéng"},
  {ctx:"Xiànzài ___ diǎn?",audio:"现在几点？",A:{h:"几",p:"jǐ",e:"how many (<10)"},B:{h:"多少",p:"duōshǎo",e:"how many/much"},ans:0,tip:"几 jǐ = used for time (几点) | 多少 = for larger amounts or prices"},
  {ctx:"Tā ___ le.",audio:"他走了。",A:{h:"来",p:"lái",e:"came"},B:{h:"走",p:"zǒu",e:"left/walked"},ans:1,tip:"lái = came/arrived | zǒu = left/walked away"},
  {ctx:"___ shì wǒ de shū.",audio:"这是我的书。",A:{h:"这",p:"zhè",e:"this"},B:{h:"那",p:"nà",e:"that"},ans:0,tip:"zhè = this (closer) | nà = that (further away)"},
  {ctx:"Tāmen ___ le.",audio:"他们去法院了。",A:{h:"发言",p:"fāyán",e:"to speak/make statement"},B:{h:"法院",p:"fǎyuàn",e:"court/law court"},ans:1,tip:"fāyán (1+2) = speak | fǎyuàn (3+4) = court — different tones"},
  {ctx:"Wǒ xǐhuan ___ tài jí quán.",audio:"我喜欢打太极拳。",A:{h:"打",p:"dǎ",e:"to do/play"},B:{h:"大",p:"dà",e:"big"},ans:0,tip:"打 dǎ (3rd) = do/play sports | 大 dà (4th) = big"}
];
