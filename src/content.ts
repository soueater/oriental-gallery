export const navigation = [
  { id: 'collection', label: '册页观物' },
  { id: 'journey', label: '循迹而行' },
  { id: 'scenes', label: '移步换景' },
  { id: 'about', label: '关于展馆' },
]

export type Artwork = {
  id: string; number: string; title: string; subtitle: string; caption: string;
  image: string; position: string; description: string; observations: string[];
}

export const artworks: Artwork[] = [
  {
    id: 'mountain', number: '壹', title: '远岫含烟', subtitle: '观山 · 在层叠中见辽阔',
    caption: '水墨山水 / 数字创作', image: 'hero', position: '75% 30%',
    description: '山的远近，不止由大小决定。浓淡相接的墨色、被云气隔开的峰峦，以及山脚的一点人间，共同构成可游可居的空间。这幅数字创作以宋式山水的观看方式为起点，重新组织山、树与水岸。',
    observations: ['看远山：淡墨让山峰退入空气。', '看中景：水岸与亭台给空间留下尺度。', '看近景：松针与山石以浓墨收住画面。'],
  },
  {
    id: 'river', number: '贰', title: '一水知秋', subtitle: '听水 · 于留白处见流动',
    caption: '青绿山水 / 数字创作', image: 'scroll', position: '28% 80%',
    description: '一条河流把散落的山峰串成一段旅程。水面并不需要画满，空白与岸线足以让目光缓缓向前。青绿设色在这里保持克制，让明净的水气成为画面的主角。',
    observations: ['看河道：曲折的水线连接每一层景物。', '看留白：未着色的地方，也属于风景。', '看设色：松石青与赭石只在山石间轻轻相遇。'],
  },
  {
    id: 'forest', number: '叁', title: '松间有声', subtitle: '入林 · 在细微处听见风',
    caption: '山林小景 / 数字创作', image: 'hero', position: '98% 92%',
    description: '疏密之间，是风经过的方向。近处的松枝、岩石和远处的山形彼此呼应，小小的枝叶也能成为完整的世界。把目光放慢，画面便不再只是景物，而是一次安静的停留。',
    observations: ['看枝干：转折的线条承载树木的姿态。', '看疏密：枝叶之间的空隙同样重要。', '看动静：安静的画面可以容纳风的想象。'],
  },
]

export const steps = [
  { number: '01', title: '入境', word: '一眼山水', text: '从远山与水岸开始，把目光交还给风景。' },
  { number: '02', title: '观物', word: '一页一世界', text: '走近山石、树木与水纹，辨认笔墨的轻重。' },
  { number: '03', title: '游心', word: '一卷有远近', text: '沿长卷移步，让观看成为一段自己的旅程。' },
  { number: '04', title: '留意', word: '一景入心间', text: '收藏喜欢的画境，带走一份属于此刻的宁静。' },
]

export const scenes = [
  { title: '远山见青', subtitle: '青绿长卷', number: '01', image: 'scroll', position: '50% 50%', quote: '行至山色深处，心也慢了下来。', text: '淡墨铺陈远近，青绿点染山骨。沿着河岸，一步一步走入层峦之间。', artwork: 'river' },
  { title: '烟水归舟', subtitle: '水岸小景', number: '02', image: 'hero', position: '45% 80%', quote: '一叶舟，一江水，一段不必赶路的时光。', text: '以水面的留白承接群山，让一只小舟成为辽阔中的温柔尺度。', artwork: 'mountain' },
  { title: '松风入怀', subtitle: '山林清音', number: '03', image: 'hero', position: '94% 70%', quote: '山林无言，风有回响。', text: '近看松枝的起落与山石的纹理，在浓淡之间找到安静的秩序。', artwork: 'forest' },
]

export const monthlyVisits = [128, 156, 142, 195, 218, 246]
