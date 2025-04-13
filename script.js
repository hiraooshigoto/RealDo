const playButton = document.getElementById('playButton');
const playIcon = document.getElementById('playIcon');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const progressBarElement = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const problemArea = document.getElementById('problemArea');
const titleArea = document.querySelector('.title-area h2');
//====================================================
// 定数定義
//====================================================
const BPM = 170;
const BEATS_PER_SECOND = BPM / 60;
const BEAT_INTERVAL = 60 / BPM; // 1拍の長さ（秒）
const TOTAL_DURATION = 312; // 4:19 in seconds
const audio = new Audio('assets/audio/MUSIC5170.mp3');
audio.volume = 0.7;

const HIRAGANA = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
];



//====================================================
// ギミックシステム
//====================================================
const GIMMICK_TYPES = {
    TIMER: 'timer',
    HIRAGANA: 'hiragana',
    IMAGE_SEQUENCE: 'image_sequence',
    SEGMENT: 'segment',
    DYNAMIC_TEXT: 'dynamic_text',
    WALL_IMAGE: 'wall_image',
    DOT_COUNTER: 'dot_counter',
    DYNAMIC_TEXT_GROUP: 'dynamic_text_group',
    RHYTHM_DOTS: 'rhythm_dots',
    NUMBER_TEXT: 'number_text',
    CLICK_COUNTER: 'click_counter',  // 新しく追加
    SPECIAL_CHAR: 'special_char',  // 新しく追加
    JUBEAT_GRID: 'jubeat_grid',  // jubeatのような4x4グリッド
    RHYTHM_LINES: 'rhythm_lines',  // リズム線表示用に追加
    SYMBOL_GRID: 'symbol_grid'  // ○×などの図形記号を表示するグリッド
};
// クリック回数を追跡する変数をダミーに置き換え
const clickCounts = {
    play: 0,
    prev: 0,
    next: 0,
    progress: 0,
    getTotal() {
        return 0; // 常に0を返すようにして機能を無効化
    }
};

const STAGE_CONFIGS = {
    0: {
        gimmicks: [
        ]
    },
    1: {
        gimmicks: [

        ]
    },
    2: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 50,      
                    y: 50,      
                    size: 400,  
                    dots: [
                        { x: 15, y: 55, size: 30, beat: 1 }, // テ
                        { x: 25, y: 55, size: 30, beat: 2 }, // イ
                        { x: 35, y: 55, size: 30, beat: 3 }, // ル
                        { x: 45, y: 55, size: 30, beat: 4 }, 
                        { x: 55, y: 55, size: 30, beat: 5 }, 
                        { x: 65, y: 55, size: 30, beat: 6 }, 
                        { x: 75, y: 55, size: 30, beat: 7 }, 
                        { x: 85, y: 55, size: 30, beat: 8 }  
                    ]
                }
            }
        ]
    },
    3: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.IMAGE_SEQUENCE,
                settings: {
                    x: 50,  // 中央の水平位置（%）
                    y: 50,  // 中央の垂直位置（%）
                    size: 200,  // 全体の大きさ
                    imageSize: 120,  // 各画像の大きさ（px）
                    images: [
                        'assets/images/puzzles/puzzle3-1.png',
                        'assets/images/puzzles/puzzle3-2.png',
                        'assets/images/puzzles/puzzle3-3.png',
                        'assets/images/puzzles/puzzle3-4.png'
                    ],
                    layout: 'horizontal',  // 横一列に配置
                    spacing: 30,  // 画像間の間隔（px）
                    displayAll: true,  // すべての画像を同時に表示
                    dotMapping: [0, 1, 2, 3]  // 各画像が対応するリズムドットのインデックス
                }
            }
        ]
    },
    4: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.IMAGE_SEQUENCE,
                settings: {
                    x: 50,  // 中央の水平位置（%）
                    y: 50,  // 中央の垂直位置（%）
                    size: 200,  // 画像サイズを300の80%に縮小
                    scale: 0.8,  // 画像のスケール係数（1.0が100%）
                    images: [
                        'assets/images/puzzles/puzzle4-1.png',
                        'assets/images/puzzles/puzzle4-1.png',
                        'assets/images/puzzles/puzzle4-2.png',
                        'assets/images/puzzles/puzzle4-2.png',
                        'assets/images/puzzles/puzzle4-3.png',
                        'assets/images/puzzles/puzzle4-3.png',
                        'assets/images/puzzles/puzzle4-4.png',
                        'assets/images/puzzles/puzzle4-4.png'
                    ],
                    changeOnBeat: true,  // ビートに合わせて画像を変更
                    changeInterval: BEAT_INTERVAL,  // 1拍ごとに更新
                    zIndex: 100  // 最前面に表示するため高いz-indexを設定
                }
            },
            {
                type: GIMMICK_TYPES.JUBEAT_GRID,
                settings: {
                    x: 50,      // 全体の中心X座標
                    y: 50,      // 全体の中心Y座標
                    size: 400,  // 全体のサイズ
                    // アニメーションの順序制御設定
                    animation: {
                        sequenceMode: "custom",    // "custom"：カスタムタイミング制御
                        delayStep: 0.2,           // 遅延ステップの間隔（秒）
                    },
                    // jubeat式の4x4パネル - カスタム点灯パターン
                    panels: [
                        // row: 行（0-3、上から下）
                        // col: 列（0-3、左から右）
                        // startBeat: このパネルが点灯し始める拍（整数部分が拍番号、小数部分は拍内位置 0.0-0.99）
                        // endBeat: このパネルが消灯する拍（省略すると startBeat + 1.0）
                        // order: 同じ点灯タイミングのパネル間での順序（アニメーション順）
                        
                        // ビート1-2: 左上の4つ
                        { row: 3, col: 2, startBeat: 1.1, endBeat: 2.9, order: 0 },
                        { row: 1, col: 3, startBeat: 1.45, endBeat: 2.9, order: 1 },
                        { row: 0, col: 1, startBeat: 1.8, endBeat: 2.9, order: 2 },
                        { row: 2, col: 0, startBeat: 2.15, endBeat: 2.9, order: 3 },
                        
                        // ビート3-4: 右上の4つ
                        { row: 0, col: 3, startBeat: 3.1, endBeat: 4.9, order: 0 },
                        { row: 1, col: 2, startBeat: 3.5, endBeat: 4.9, order: 1 },
                        { row: 2, col: 1, startBeat: 3.9, endBeat: 4.9, order: 2 },
                        
                        
                        // ビート5-6: 左下の4つ
                        { row: 2, col: 2, startBeat: 5.1, endBeat: 6.9, order: 0 },
                        { row: 2, col: 0, startBeat: 5.45, endBeat: 6.9, order: 1 },
                        { row: 1, col: 1, startBeat: 5.8, endBeat: 6.9, order: 2 },
                        { row: 0, col: 0, startBeat: 6.15, endBeat: 6.9, order: 3 },
                        
                        // ビート7-8: 右下の4つ
                        { row: 2, col: 1, startBeat: 7.1, endBeat: 8.9, order: 0 },
                        { row: 1, col: 3, startBeat: 7.5, endBeat: 8.9, order: 1 },
                        { row: 0, col: 2, startBeat: 7.9, endBeat: 8.9, order: 2 }
                    ],
                    // 元のdotsデータも保持（機能を維持するため）
                    dots: [
                        { x: 20, y: 20, size: 30, beat: 1 },  // 左上
                        { x: 80, y: 20, size: 30, beat: 2 },  // 右上
                        { x: 20, y: 40, size: 30, beat: 3 },  // 左から2番目
                        { x: 80, y: 40, size: 30, beat: 4 },  // 右から2番目
                        { x: 20, y: 60, size: 30, beat: 5 },  // 左から3番目
                        { x: 80, y: 60, size: 30, beat: 6 },  // 右から3番目
                        { x: 20, y: 80, size: 30, beat: 7 },  // 左下
                        { x: 80, y: 80, size: 30, beat: 8 }   // 右下
                    ]
                }
            }
        ]
    },
    5: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 55,      // 中央に配置
                    y: 65,      // 上部に配置
                    size: 400,  // サイズ調整
                    color: "#FF8888", // 赤色
                    dots: [
                        { x: 10, y: 50, size: 40, beat: 1 },
                        { x: 20, y: 50, size: 40, beat: 2 },
                        { x: 30, y: 50, size: 40, beat: 3 },
                        { x: 40, y: 50, size: 40, beat: 4 },
                        { x: 50, y: 50, size: 40, beat: 5 },
                        { x: 60, y: 50, size: 40, beat: 6 },
                        { x: 70, y: 50, size: 40, beat: 7 },
                        { x: 80, y: 50, size: 40, beat: 8 }
                    ]
                }
            },
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 55,      // 中央に配置
                    y: 75,      // 中央に配置
                    size: 400,  // サイズ調整
                    color: "#8888FF", // 青色
                    dots: [
                        { x: 10, y: 50, size: 40, beat: 1 },
                        { x: 20, y: 50, size: 40, beat: 2 },
                        { x: 30, y: 50, size: 40, beat: 3 },
                        { x: 40, y: 50, size: 40, beat: 4 },
                        { x: 50, y: 50, size: 40, beat: 5 },
                        { x: 60, y: 50, size: 40, beat: 6 },
                        { x: 70, y: 50, size: 40, beat: 7 },
                        { x: 80, y: 50, size: 40, beat: 8 }
                    ]
                }
            },
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 55,      // 中央に配置
                    y: 85,      // 下部に配置
                    size: 400,  // サイズ調整
                    color: "#88FF88", // 緑色
                    dots: [
                        { x: 10, y: 50, size: 40, beat: 1 },
                        { x: 20, y: 50, size: 40, beat: 2 },
                        { x: 30, y: 50, size: 40, beat: 3 },
                        { x: 40, y: 50, size: 40, beat: 4 },
                        { x: 50, y: 50, size: 40, beat: 5 },
                        { x: 60, y: 50, size: 40, beat: 6 },
                        { x: 70, y: 50, size: 40, beat: 7 },
                        { x: 80, y: 50, size: 40, beat: 8 }
                    ]
                }
            }
        ]
    },
    6: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 55,      // 中央に配置
                    y: 45,      // 上部に配置
                    size: 400,  // サイズ調整
                    color: "#FF6060", // 落ち着いた赤色
                    dots: [
                        { x: 10, y: 50, size: 30, beat: 1 },
                        { x: 20, y: 50, size: 30, beat: 2 },
                        { x: 30, y: 50, size: 30, beat: 3 },
                        { x: 40, y: 50, size: 30, beat: 4 },
                        { x: 50, y: 50, size: 30, beat: 5 },
                        { x: 60, y: 50, size: 30, beat: 6 },
                        { x: 70, y: 50, size: 30, beat: 7 },
                        { x: 80, y: 50, size: 30, beat: 8 }
                    ]
                }
            },
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 55,      // 中央に配置
                    y: 55,      // 中央に配置
                    size: 400,  // サイズ調整
                    color: "#6060FF", // 落ち着いた青色
                    dots: [
                        { x: 10, y: 50, size: 30, beat: 1 },
                        { x: 20, y: 50, size: 30, beat: 2 },
                        { x: 30, y: 50, size: 30, beat: 3 },
                        { x: 40, y: 50, size: 30, beat: 4 },
                        { x: 50, y: 50, size: 30, beat: 5 },
                        { x: 60, y: 50, size: 30, beat: 6 },
                        { x: 70, y: 50, size: 30, beat: 7 },
                        { x: 80, y: 50, size: 30, beat: 8 }
                    ]
                }
            },
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 55,      // 中央に配置
                    y: 65,      // 下部に配置
                    size: 400,  // サイズ調整
                    color: "#60FF60", // 落ち着いた緑色
                    dots: [
                        { x: 10, y: 50, size: 30, beat: 1 },
                        { x: 20, y: 50, size: 30, beat: 2 },
                        { x: 30, y: 50, size: 30, beat: 3 },
                        { x: 40, y: 50, size: 30, beat: 4 },
                        { x: 50, y: 50, size: 30, beat: 5 },
                        { x: 60, y: 50, size: 30, beat: 6 },
                        { x: 70, y: 50, size: 30, beat: 7 },
                        { x: 80, y: 50, size: 30, beat: 8 }
                    ]
                }
            }
        ]
    },
    7: {
        gimmicks: [

            {
                type: GIMMICK_TYPES.RHYTHM_LINES,
                settings: {
                    x: 50,      // 中央に配置
                    y: 50,      // 中央に配置
                    size: 400,  // サイズ調整
                    scaleFactor: 0.7, // 全体のスケール係数（1.0が100%のサイズ、小さくするとコンパクトに）
                    color: "#000", // 線の色
                    lineWidth: 2, // 線の太さ（初期値）
                    lines: [
                        // 各ビートに対応する線の設定 - 漢字「画」の筆順に合わせて8画で構成
                        { beat: 1, x1: 17, y1: 15, x2: 83, y2: 15, width: 2 }, // 第1画：上の横線 - やや太め
                        { beat: 2, x1: 25, y1: 30, x2: 25, y2: 80, width: 2 }, // 第2画：左の縦線 - 標準
                        { beat: 3, x1: 25, y1: 30, x2: 75, y2: 30, width: 2 }, // 第3画：下の横線 - 標準
                        { beat: 3, x1: 75, y1: 30, x2: 75, y2: 80, width: 2 }, // 第3画：下の横線 - 標準
                        { beat: 4, x1: 50, y1: 15, x2: 50, y2: 80, width: 2 }, // 第4画：右の縦線 - やや太め
                        
                        // ビート5では一度に複数の線を描画（內の上部）
                        { beat: 5, x1: 25, y1: 55, x2: 75, y2: 55, width: 2 }, // 第5画：内側の上の横線
                        
                        // ビート6でも複数の線（內の左側）
                        { beat: 6, x1: 25, y1: 80, x2: 75, y2: 80, width: 2 }, // 第6画：内側の左の縦線 - やや太め
                        
                        // ビート7も複数線（內の下部）
                        { beat: 7, x1: 10, y1: 30, x2: 10, y2: 95, width: 2 }, // 第7画：内側の下の横線
                        { beat: 7, x1: 10, y1: 95, x2: 90, y2: 95, width: 2 }, // 第7画：内側の下の - やや太め
                        // ビート8も複数線（內の右側）
                        { beat: 8, x1: 90, y1: 30, x2: 90, y2: 95, width: 2 }  // 第8画：内側の右の縦線 - 最も太い
                    ]
                }
            }
        ]
    },
    8: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.SYMBOL_GRID,
                settings: {
                    x: 47,      // 全体の中心X座標
                    y: 50,      // 全体の中心Y座標
                    size: 500,  // 全体のサイズ
                    symbolSize: 40, // デフォルトのシンボルサイズ
                    strokeWidth: 5, // デフォルトの線の太さ
                    rows: [
                        {
                            color: "#FF6060", // 赤色
                            symbols: [
                                { x: 30, y: 48, beatNumber: 1, size: 90 },
                                { x: 45, y: 48, beatNumber: 2, size: 90 },
                                { x: 60, y: 48, beatNumber: 3, size: 90 },
                                { x: 75, y: 48, beatNumber: 4, size: 90 }
                            ]
                        },
                        {
                            color: "#6060FF", // 青色
                            symbols: [
                                { x: 27, y: 57, beatNumber: 1, size: 40 },
                                { x: 42, y: 57, beatNumber: 2, size: 40 },
                                { x: 57, y: 57, beatNumber: 3, size: 40 },
                                { x: 72, y: 57, beatNumber: 4, size: 40 }
                            ]
                        },
                        {
                            color: "#00FF00", // 緑色
                            symbols: [
                                { x: 33, y: 57, beatNumber: 1, size: 40 },
                                { x: 48, y: 57, beatNumber: 2, size: 40 },
                                { x: 63, y: 57, beatNumber: 3, size: 40 },
                                { x: 78, y: 57, beatNumber: 4, size: 40 }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    9: {
        gimmicks: [

        ]
    },
    10: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.IMAGE_SEQUENCE,
                settings: {
                    x: 50,
                    y: 50,
                    size: 150,
                    images: Array.from({ length: 8 }, (_, i) => `assets/images/puzzles/stage10/black${i}.png`),
                    changeInterval: 60 * 4 / 170 / 4
                }
            }
        ]
    },
    11: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.WALL_IMAGE,
                settings: {
                    x: 50,
                    y: 50,
                    size: 100,  // 100%のサイズで表示
                    images: Array.from({ length: 16 }, (_, i) => `assets/images/puzzles/wall/wall${i}.png`)
                }
            }
        ]
    },
    12: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.WALL_IMAGE,
                settings: {
                    x: 50,
                    y: 50,
                    size: 100,  // 100%のサイズで表示
                    images: Array.from({ length: 16 }, (_, i) => `assets/images/puzzles/wall/wall${i}.png`)
                }
            }
        ]
    },
    13: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 50,      
                    y: 50,      
                    size: 400,  
                    dots: [
                        // beat: どの拍に属するか
                        { x: 50, y: 53, size: 30, beat: 1 }, 
                        { x: 58, y: 12, size: 30, beat: 1 },  // 1拍目のドット
                        
                        // 2拍目の3つのドット
                        { x: 40, y: 12, size: 30, beat: 2 },
                        { x: 41, y: 26, size: 30, beat: 2 },
                        { x: 51.5, y: 89, size: 30, beat: 2 },
                        
                        { x: 40, y: 53, size: 30, beat: 3 },  // 3拍目のドット

                        { x: 90, y: 40, size: 30, beat: 4 },
                        { x: 90, y: 50, size: 30, beat: 5 },
                        { x: 90, y: 60, size: 30, beat: 6 },

                        { x: 60, y: 26, size: 30, beat: 7 },  // 4拍目のドット
                    ]
                }
            }
        ]
    },
    14: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 50,      // 全体の中心X座標
                    y: 50,      // 全体の中心Y座標
                    size: 400,  // 全体のサイズ
                    dots: [
                        { x: 50, y: 35, size: 25, beat: 1 },  // 左上
                        { x: 73, y: 35, size: 25, beat: 2 },  // 右上
                        { x: 40, y: 85, size: 25, beat: 3 },  // 左から2番目
                        { x: 39, y: 35, size: 25, beat: 4 },  // 右から2番目
                        { x: 61.5, y: 35, size: 25, beat: 5 },  // 左から3番目
                        { x: 84, y: 35, size: 25, beat: 6 },  // 右から3番目
                        { x: 50, y: 85, size: 25, beat: 7 },  // 左下
                        { x: 60, y: 85, size: 25, beat: 8 }   // 右下
                    ]
                }
            }
        ]
    },

    15: {
        gimmicks: [
            {
                type: GIMMICK_TYPES.RHYTHM_DOTS,
                settings: {
                    x: 50,      
                    y: 50,      
                    size: 400,  
                    dots: [
                        // beat: どの拍に属するか
                        { x: 50, y: 53, size: 30, beat: 1 }, 
                        { x: 58, y: 12, size: 30, beat: 1 },  // 1拍目のドット
                        
                        // 2拍目の3つのドット
                        { x: 40, y: 12, size: 30, beat: 2 },
                        { x: 41, y: 26, size: 30, beat: 2 },
                        { x: 51.5, y: 89, size: 30, beat: 2 },
                        
                        { x: 40, y: 53, size: 30, beat: 3 },  // 3拍目のドット

                        { x: 90, y: 40, size: 30, beat: 4 },
                        { x: 90, y: 50, size: 30, beat: 5 },
                        { x: 90, y: 60, size: 30, beat: 6 },

                        { x: 60, y: 26, size: 30, beat: 7 },  // 4拍目のドット
                    ]
                }
            }
        ]
    },
    16: {
        gimmicks: [
            // クリックカウンターを削除
        ]
    },
    17: {
        gimmicks: [
            // クリックカウンターを削除
            {
                type: GIMMICK_TYPES.RECORDS_DISPLAY,
                settings: {
                    x: 50,
                    y: 60,
                    size: 150
                }
            },
        ]
    },
    
};

// リズムドットの表示設定を管理するオブジェクト（プレイヤーに見えるかどうかのみを制御し、実際のゲーム機能は通常通り動作）
const RHYTHM_DOTS_VISIBILITY = {
    0: true,  // ステージ0：プレイヤーに表示
    1: true,  // ステージ1：プレイヤーに表示
    2: true,  // ステージ2：プレイヤーに表示
    3: true,  // ステージ3：プレイヤーに表示
    4: true,  // ステージ4：プレイヤーに表示
    5: true,  // ステージ5：プレイヤーに表示
    6: true,  // ステージ6：プレイヤーに表示
    7: true,  // ステージ7：プレイヤーに表示
    8: true,  // ステージ8：プレイヤーに表示
    9: true,  // ステージ9：プレイヤーに表示
    10: true, // ステージ10：プレイヤーに表示
    11: true, // ステージ11：プレイヤーに表示
    12: false, // ステージ12：プレイヤーに非表示（実際のゲーム機能は通常通り動作）
    13: true, // ステージ13：プレイヤーに表示
    14: true, // ステージ14：プレイヤーに表示
    15: true, // ステージ15：プレイヤーに表示
    16: true, // ステージ16：プレイヤーに表示
    17: true  // ステージ17：プレイヤーに表示
};

// ローカルストレージから表示設定を読み込む
function loadRhythmDotsVisibility() {
    const saved = localStorage.getItem('rhythmDotsVisibility');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            for (const stage in settings) {
                if (RHYTHM_DOTS_VISIBILITY.hasOwnProperty(stage)) {
                    RHYTHM_DOTS_VISIBILITY[stage] = settings[stage];
                }
            }
        } catch (e) {
            console.error('リズムドット表示設定の読み込みに失敗しました', e);
        }
    }
}

// ローカルストレージに表示設定を保存する
function saveRhythmDotsVisibility() {
    try {
        localStorage.setItem('rhythmDotsVisibility', JSON.stringify(RHYTHM_DOTS_VISIBILITY));
    } catch (e) {
        console.error('リズムドット表示設定の保存に失敗しました', e);
    }
}

// 起動時に設定を読み込む
loadRhythmDotsVisibility();

const STAGE_NAMES = [
    "チュートリアル",
    "Do", "イコールの下が答えだ！", "輝き",
    "選択", "0or1", "数式",
    "道しるべ(きまぐれ)", "夜空", "おいしそう！",
    "チカチカ", "問題を成立させよう！", "西？",
    "九？", "一週間", "楽器の名前をこたえよう",
    "最終ステージ-がんばれ～", "エンディング-おめでとう！"
];

const PUZZLE_IMAGES = {
    0: "assets/images/puzzles/puzzle0.png",
    1: "assets/images/puzzles/puzzle1.png",
    2: "assets/images/puzzles/puzzle2.png",
    3: "assets/images/puzzles/puzzle999.png",
    4: "assets/images/puzzles/puzzle4.png",
    5: "assets/images/puzzles/puzzle5.png",
    6: "assets/images/puzzles/puzzle6.png",
    7: "assets/images/puzzles/puzzle999.png",
    8: "assets/images/puzzles/puzzle999.png",
    9: "assets/images/puzzles/puzzle9.png",
    10: "assets/images/puzzles/puzzle999.png",
    11: "assets/images/puzzles/puzzle11.png",
    12: "assets/images/puzzles/puzzle12.png",
    13: "assets/images/puzzles/puzzle13.png",
    14: "assets/images/puzzles/puzzle14.png",
    15: "assets/images/puzzles/puzzle15.png",
    16: "assets/images/puzzles/puzzle16.png",
    17: "assets/images/puzzles/puzzle17.png"
};

// ヒントシステム
const STAGE_HINTS = {};
const STAGE_HINT_LOOPS = {};
const HINT_ANSWERS = {};
let hintShown = false;

let loopCount = 0;

const STAGE_ANSWERS = {
    0: "ーーー",
    1: "ーーー",
    2: "テイル",
    3: "ブライト",
    4: "せんたく",
    5: "ーーー",
    6: "十",
    7: "ぼういん",
    8: "つきみ",
    9: "ーーー",
    10: "ーーー",
    11: "午(うま)",
    12: "インク",
    13: "七",
    14: "てんかい",
    15: "？？",
    16: "",
    17: "THANK YOU FOR PLAYING"
};
// Twitter共有用の関数を更新
function shareToTwitter() {
    // クリック回数のインクリメントを削除
    const text = encodeURIComponent('「Do」をクリアした！\n#Do謎 #Player謎');
    const url = encodeURIComponent('https://twitter.com/Souchan917/status/1880596843299737622');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

// エンディング画面の更新関数を修正
function updateProblemElements() {
    if (currentStage === 17) {
        // エンディング画面用の特別なレイアウト
        problemArea.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: white;
                border-radius: 10px;
                padding: 20px;
            ">
                <div style="
                    font-size: 48px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 30px;
                    font-family: 'M PLUS Rounded 1c', sans-serif;
                ">CLEAR</div>
            </div>
        `;

        // answer-area を更新
        const answerArea = document.querySelector('.answer-area');
        if (answerArea) {
            answerArea.innerHTML = `
                <p style="margin-bottom: 20px;">クリアおめでとう！</p>
                <button 
                    onclick="shareToTwitter()"
                    style="
                        padding: 12px 24px;
                        background-color: #1DA1F2;
                        color: white;
                        border: none;
                        border-radius: 20px;
                        font-size: 16px;
                        cursor: pointer;
                        font-family: 'M PLUS Rounded 1c', sans-serif;
                        margin-top: 10px;
                        z-index: 1000;
                    "
                >
                    Xで共有
                </button>
            `;
        }
    } else {
        gimmickManager.updateGimmick(currentStage, currentTime);
        gimmickManager.hideAllExcept(currentStage);
    }

    // 結果ボックスの表示を制御
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
        // ステージ7の場合のみ表示
        if (currentStage === 7) {
            resultBox.style.display = 'flex';
        } else {
            resultBox.style.display = 'none';
        }
    }
}

// answer-areaの更新関数も修正
function updateAnswer() {
    // 答え表示機能は削除
}

const stageSettings = {
    0: { dots: 4 },
    1: { dots: 4 },
    2: { dots: 8 },
    3: { dots: 4 },
    4: { dots: 8 },
    5: { dots: 8 },
    6: { dots: 8 },
    7: { dots: 8 },
    8: { dots: 4, lines: 3 }, // 4ドット×3ライン
    9: { dots: 8 },
    10: { dots: 4 },
    11: { dots: 16 },
    12: { dots: 8 },
    13: { dots: 8 },
    14: { dots: 8 },
    15: { dots: 8 },
    16: { dots: 8 },
    17: { dots: 8 }
};
const correctPatterns = {
    // 各ステージのパターン
    // 各ステージは、ライン別の配列を持つ配列に変更（複数ラインをサポート）
    // 0-4ステージは1ライン
    0: [
        [1, 2, 3, 4] // ライン0（aキー）のパターン
    ],
    1: [
        [1, 2, 4] // ライン0のパターン
    ],
    2: [
        [2, 6, 8] // ライン0のパターン
    ],
    3: [
        [1, 2, 4] // ライン0のパターン
    ],
    4: [
        [1, 4] // ライaン0のパターン
    ],
    
    // 5-8ステージは3ライン
    5: [
        [1, 2, 7], // ライン0（aキー）のパターン
        [2, 4, 5, 7, 8], // ライン1（sキー）のパターン
        [1, 2, 7]  // ライン2（dキー）のパターン
    ],
    6: [
        [5, 6, 7], // ライン0のパターン
        [3, 4, 5, 6], // ライン1のパターン
        [1, 2, 3, 4, 5]     // ライン2のパターン // ライン2（dキー）のパターン
    ],
    7: [
        [2, 3, 6], // ライン0のパターン
        [7, 8], // ライン1のパターン
        [1, 4]  // ライン2のパターン
    ],
    8: [
        [1, 3, 4], // ライン0のパターン
        [1, 3], // ライン1のパターン
        [2, 4]  // ライン2のパターン
    ],
    
    // 9-12ステージは4ライン
    9: [
        [1], // ライン0（aキー）のパターン
        [9], // ライン1（sキー）のパターン
        [2], // ライン2（dキー）のパターン
        [1]  // ライン3（fキー）のパターン
    ],
    10: [
        [1, 2, 3], // ライン0のパターン
        [1], // ライン1のパターン
        [2, 3], // ライン2のパターン
        [1, 4]  // ライン3のパターン
    ],
    11: [
        [13], // ライン0のパターン
        [5],  // ライン1のパターン
        [8],  // ライン2のパターン
        [1]   // ライン3のパターン
    ],
    12: [
        [1, 5, 9], // ライン0のパターン
        [2, 6, 10], // ライン1のパターン
        [3, 7, 11], // ライン2のパターン
        [4, 8, 12]  // ライン3のパターン
    ],
    
    // 13-16ステージは8ライン
    13: [
        [1, 2], // ライン0のパターン
        [3, 4], // ライン1のパターン
        [5, 6], // ライン2のパターン
        [7, 8], // ライン3のパターン
        [1, 3], // ライン4のパターン
        [2, 4], // ライン5のパターン
        [5, 7], // ライン6のパターン
        [6, 8]  // ライン7のパターン
    ],
    14: [
        [1, 8], // ライン0のパターン
        [2, 7], // ライン1のパターン
        [3, 6], // ライン2のパターン
        [4, 5], // ライン3のパターン
        [1, 4], // ライン4のパターン
        [2, 3], // ライン5のパターン
        [5, 8], // ライン6のパターン
        [6, 7]  // ライン7のパターン
    ],
    15: [
        [1], // ライン0のパターン
        [2], // ライン1のパターン
        [3], // ライン2のパターン
        [4], // ライン3のパターン
        [5], // ライン4のパターン
        [6], // ライン5のパターン
        [7], // ライン6のパターン
        [8]  // ライン7のパターン
    ],
    16: [
        [1, 3, 5, 7], // ライン0のパターン
        [2, 4, 6, 8], // ライン1のパターン
        [1, 4, 5, 8], // ライン2のパターン
        [2, 3, 6, 7], // ライン3のパターン
        [1, 2, 5, 6], // ライン4のパターン
        [3, 4, 7, 8], // ライン5のパターン
        [1, 4, 6, 7], // ライン6のパターン
        [2, 3, 5, 8]  // ライン7のパターン
    ],
    17: [
        [2, 4, 6, 8] // 1ラインのみ
    ]
};
//====================================================
// ゲーム状態管理
//====================================================
let isPlaying = false;
let currentTime = 0;
let currentStage = 0;
let clearedStages = new Set();
let currentBeatProgress = 0;
let selectedBeats = new Set();
let lastBeat = -1;
let isLoopComplete = false;
let isHolding = false;
let holdStartBeat = -1;

//====================================================
// ギミック管理クラス
//====================================================
class GimmickManager {
    constructor() {
        this.elements = new Map();
        this.activeWallImages = new Map();
    }

    createGimmickElement(stageId, gimmickIndex) {
        const config = STAGE_CONFIGS[stageId]?.gimmicks[gimmickIndex];
        if (!config) return null;

        const element = document.createElement('div');
        element.className = 'problem-element';
        element.id = `gimmick-${stageId}-${gimmickIndex}`;

        // ステージ4の画像シーケンスには特別なスタイル
        if (stageId === 4 && config.type === GIMMICK_TYPES.IMAGE_SEQUENCE) {
            element.style.zIndex = '100';
            element.style.background = 'none';
            element.style.border = 'none';
            element.style.boxShadow = 'none';
        }

        if (config.type === GIMMICK_TYPES.NUMBER_TEXT) {
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.width = '100%';
            container.style.height = '100%';
            
            // 各単語用のコンテナを作成
            config.settings.words.forEach((word, wordIndex) => {
                const wordContainer = document.createElement('div');
                wordContainer.className = 'number-text-word';
                wordContainer.style.position = 'absolute';
                
                // 文字を1つずつ作成
                const chars = word.text.split('');
                chars.forEach((char, charIndex) => {
                    const charElement = document.createElement('span');
                    charElement.className = 'number-text-char';
                    // 特殊文字（#）は一時的に空白に
                    charElement.textContent = char === '#' ? '' : char;
                    wordContainer.appendChild(charElement);
                });
                
                container.appendChild(wordContainer);
            });
            
            element.appendChild(container);
        }

        if (config.type === GIMMICK_TYPES.IMAGE_SEQUENCE) {
            // ステージ4のシーケンスには特別なスタイル
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            
            if (stageId === 4) {
                img.style.position = 'relative';
                img.style.zIndex = '100';
                img.style.opacity = '0.7'; // 透明度を70%に設定
            }
            
            element.appendChild(img);
        }

        if (config.type === GIMMICK_TYPES.DOT_COUNTER) {
            const container = document.createElement('div');
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            element.appendChild(container);
        }

        if (config.type === GIMMICK_TYPES.RHYTHM_DOTS) {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.width = '100%';
            container.style.height = '100%';
            
            // 各ドットの作成
            config.settings.dots.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'rhythm-dot-in-puzzle';
                dot.style.position = 'absolute';
                container.appendChild(dot);
            });
            
            element.appendChild(container);
        }

        // RHYTHM_LINES タイプのエレメント作成処理を追加
        if (config.type === GIMMICK_TYPES.RHYTHM_LINES) {
            const container = document.createElement('div');
            container.className = 'rhythm-lines-container';
            container.style.position = 'absolute';
            container.style.width = '100%';
            container.style.height = '100%';
            
            // SVG要素を作成
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            
            // 各線のためのグループを作成
            const linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            linesGroup.classList.add('rhythm-lines-group');
            svg.appendChild(linesGroup);
            
            // 各線の作成
            config.settings.lines.forEach((lineConfig, index) => {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.classList.add('rhythm-line');
                line.setAttribute('data-beat', lineConfig.beat);
                line.setAttribute('data-index', index);
                line.style.opacity = '0'; // 初期状態は非表示
                line.style.strokeLinecap = 'round'; // 線の端を丸くする
                linesGroup.appendChild(line);
            });
            
            container.appendChild(svg);
            element.appendChild(container);
        }

        // JUBEAT_GRID タイプのエレメント作成処理を追加
        if (config.type === GIMMICK_TYPES.JUBEAT_GRID) {
            this._createJubeatGridElement(element, config);
        }

        // SYMBOL_GRID タイプのエレメント作成処理を追加
        if (config.type === GIMMICK_TYPES.SYMBOL_GRID) {
            this._createSymbolGridElement(element, config);
        }

        problemArea.appendChild(element);
        this.elements.set(`${stageId}-${gimmickIndex}`, element);
        return element;
    }

    // jubeatスタイルのグリッドエレメントを作成
    _createJubeatGridElement(element, config) {
        const container = document.createElement('div');
        container.className = 'jubeat-grid-container';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(4, 1fr)';
        container.style.gridTemplateRows = 'repeat(4, 1fr)';
        container.style.gap = '6px';
        container.style.padding = '8px';
        container.style.backgroundColor = 'rgb(5, 5, 5)';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.7)';
        container.style.border = '1px solid rgba(50, 50, 50, 0.3)';
        
        // 4x4のグリッドパネルを作成
        for (let i = 0; i < 16; i++) {
            const panel = document.createElement('div');
            panel.className = 'jubeat-panel';
            panel.setAttribute('data-panel-index', i);
            
            // パネルの行と列を計算
            const row = Math.floor(i / 4);
            const col = i % 4;
            panel.setAttribute('data-row', row);
            panel.setAttribute('data-col', col);
            
            // グロー効果要素
            const glow = document.createElement('div');
            glow.className = 'jubeat-panel-glow';
            
            // パネル内の光沢効果（highlight）要素を追加
            const highlight = document.createElement('div');
            highlight.className = 'jubeat-panel-highlight';
            highlight.style.position = 'absolute';
            highlight.style.top = '0';
            highlight.style.left = '0';
            highlight.style.width = '100%';
            highlight.style.height = '40%';
            highlight.style.background = 'linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 0%, transparent 100%)';
            highlight.style.borderRadius = '3px 3px 0 0';
            
            // パネルの縁を強調する細い枠線
            const innerBorder = document.createElement('div');
            innerBorder.className = 'jubeat-panel-border';
            innerBorder.style.position = 'absolute';
            innerBorder.style.top = '0';
            innerBorder.style.left = '0';
            innerBorder.style.width = '100%';
            innerBorder.style.height = '100%';
            innerBorder.style.boxSizing = 'border-box';
            innerBorder.style.border = '1px solid rgba(80, 80, 80, 0.7)';
            innerBorder.style.borderRadius = '3px';
            innerBorder.style.pointerEvents = 'none';
            
            panel.appendChild(glow);
            panel.appendChild(highlight);
            panel.appendChild(innerBorder);
            container.appendChild(panel);
        }
        
        element.appendChild(container);
        return container;
    }

    _countSelectedDotsInRange(start, end) {
        let count = 0;
        for (let i = start; i <= end; i++) {
            if (selectedBeats.has(i)) {
                count++;
            }
        }
        return count;
    }

    _generateDotCounterText(count, baseNumber) {
        return baseNumber + '0'.repeat(count);
    }

    _setupTextStyles(element, size) {
        element.style.fontSize = `${size * 0.5}px`;
        element.style.lineHeight = `${size}px`;
        element.style.textAlign = 'center';
        element.style.display = 'flex';
        element.style.justifyContent = 'center';
        element.style.alignItems = 'center';
        element.style.fontFamily = "'M PLUS Rounded 1c', sans-serif";
    }

    _updateTimerGimmick(element, currentTime) {
        element.textContent = formatTime(currentTime);
    }

    _updateHiraganaGimmick(element, config, currentTime) {
        const charIndex = Math.floor(currentTime / config.settings.changeInterval) % config.settings.characters.length;
        element.textContent = config.settings.characters[charIndex];
    }

    _updateImageSequenceGimmick(element, config, currentTime) {
        // displayAllがtrueの場合は複数画像を表示
        if (config.settings.displayAll) {
            // まず既存の内容をクリア
            element.innerHTML = '';
            
            // レイアウトに応じてコンテナを作成
            if (config.settings.layout === 'grid') {
                // グリッドレイアウト用のコンテナ
                const gridContainer = document.createElement('div');
                gridContainer.style.display = 'grid';
                gridContainer.style.gridTemplateColumns = `repeat(${config.settings.gridCols}, 1fr)`;
                gridContainer.style.gap = `${config.settings.gridGap}px`;
                gridContainer.style.width = '100%';
                gridContainer.style.height = '100%';
                
                // すべての画像を追加
                config.settings.images.forEach((imagePath, index) => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.display = 'flex';
                    imgWrapper.style.justifyContent = 'center';
                    imgWrapper.style.alignItems = 'center';
                    
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'contain';
                    
                    // スケール設定がある場合は適用
                    if (config.settings.scale !== undefined) {
                        img.style.transform = `scale(${config.settings.scale})`;
                    }
                    
                    // リズムドットのマッピングがあり、対応するドットが選択されている場合は反転
                    if (config.settings.dotMapping && typeof config.settings.dotMapping[index] !== 'undefined') {
                        const dotIndex = config.settings.dotMapping[index];
                        const beatKey = `0-${dotIndex + 1}`; // ライン0 + ビート番号をキーとして使用
                        const isSelected = selectedBeats.has(beatKey);
                        if (isSelected) {
                            img.style.transform = 'rotate(180deg)';
                            
                            // スケール設定がある場合は回転と組み合わせる
                            if (config.settings.scale !== undefined) {
                                img.style.transform = `rotate(180deg) scale(${config.settings.scale})`;
                            }
                        }
                    }
                    
                    imgWrapper.appendChild(img);
                    gridContainer.appendChild(imgWrapper);
                });
                
                element.appendChild(gridContainer);
            } else if (config.settings.layout === 'horizontal') {
                // 水平レイアウト用のコンテナ
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.flexDirection = 'row';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.gap = `${config.settings.spacing}px`;
                container.style.width = '100%';
                container.style.height = '100%';
                
                // 各画像のサイズを設定
                const imageSize = config.settings.imageSize || (config.settings.size / config.settings.images.length - config.settings.spacing);
                
                // すべての画像を追加
                config.settings.images.forEach((imagePath, index) => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.flexShrink = '0';
                    imgWrapper.style.width = `${imageSize}px`;
                    imgWrapper.style.height = `${imageSize}px`;
                    imgWrapper.style.display = 'flex';
                    imgWrapper.style.justifyContent = 'center';
                    imgWrapper.style.alignItems = 'center';
                    
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';
                    img.style.objectFit = 'contain';
                    img.dataset.imageIndex = index;
                    
                    // スケール設定がある場合は適用
                    if (config.settings.scale !== undefined) {
                        img.style.transform = `scale(${config.settings.scale})`;
                    }
                    
                    // リズムドットのマッピングがあり、対応するドットが選択されている場合は反転
                    if (config.settings.dotMapping && typeof config.settings.dotMapping[index] !== 'undefined') {
                        const dotIndex = config.settings.dotMapping[index];
                        const beatKey = `0-${dotIndex + 1}`; // ライン0 + ビート番号をキーとして使用
                        const isSelected = selectedBeats.has(beatKey);
                        if (isSelected) {
                            img.style.transform = 'rotate(180deg)';
                            
                            // スケール設定がある場合は回転と組み合わせる
                            if (config.settings.scale !== undefined) {
                                img.style.transform = `rotate(180deg) scale(${config.settings.scale})`;
                            }
                        }
                    }
                    
                    imgWrapper.appendChild(img);
                    container.appendChild(imgWrapper);
                });
                
                element.appendChild(container);
            }
        } else {
            // 従来の単一画像シーケンス表示
            const img = element.querySelector('img');
            if (!img) {
                const newImg = document.createElement('img');
                newImg.style.width = '100%';
                newImg.style.height = '100%';
                newImg.style.objectFit = 'contain';
                
                // ステージ4の場合は特別なスタイルを追加
                if (currentStage === 4) {
                    newImg.style.position = 'relative';
                    newImg.style.zIndex = '100';
                    newImg.style.opacity = '0.7'; // 透明度を70%に設定
                    
                    // スケール設定を適用
                    if (config.settings.scale !== undefined) {
                        newImg.style.transform = `scale(${config.settings.scale})`;
                    }
                    
                    element.style.background = 'none';
                    element.style.border = 'none';
                    element.style.boxShadow = 'none';
                }
                
                element.appendChild(newImg);
                return this._updateImageSequenceGimmick(element, config, currentTime);
            }
            
            let imageIndex;
            
            // ビートベースで画像を変更するかどうか
            if (config.settings.changeOnBeat) {
                // 現在のビート位置を取得
                const dotCount = stageSettings[currentStage]?.dots || 4;
                const currentBeatProgress = (currentTime * BEATS_PER_SECOND) % dotCount;
                const currentBeat = Math.floor(currentBeatProgress);
                
                // 現在のビート位置に対応する画像を表示
                imageIndex = currentBeat % config.settings.images.length;
            } else {
                // 通常の時間ベースの更新
                imageIndex = Math.floor(currentTime / config.settings.changeInterval) % config.settings.images.length;
            }
            
            const imagePath = config.settings.images[imageIndex];
            if (img.src !== imagePath) {
                img.src = imagePath;
            }
            
            // ステージ4の場合は特別なスタイルを適用（毎回更新）
            if (currentStage === 4) {
                img.style.position = 'relative';
                img.style.zIndex = '100';
                img.style.opacity = '0.7'; // 透明度を70%に設定
                
                // スケール設定を適用
                if (config.settings.scale !== undefined) {
                    img.style.transform = `scale(${config.settings.scale})`;
                }
                
                element.style.background = 'none';
                element.style.border = 'none';
                element.style.boxShadow = 'none';
            }
        }
    }

    _updateWallImageGimmick(element, config) {
        selectedBeats.forEach(beatNumber => {
            if (!this.activeWallImages.has(beatNumber)) {
                const imageElement = document.createElement('img');
                imageElement.src = config.settings.images[beatNumber - 1];
                imageElement.style.position = 'absolute';
                imageElement.style.top = '0';
                imageElement.style.left = '0';
                imageElement.style.width = '100%';
                imageElement.style.height = '100%';
                imageElement.style.objectFit = 'cover';
                imageElement.style.zIndex = '1';
                element.appendChild(imageElement);
                this.activeWallImages.set(beatNumber, imageElement);
            }
        });

        if (isLoopComplete) {
            this.activeWallImages.forEach(img => img.remove());
            this.activeWallImages.clear();
        }
    }

    _updateDynamicTextGroupGimmick(element, config, size, scaleFactor) {
        const textSize = size * scaleFactor;
        const textGroupContainer = element;
        textGroupContainer.style.display = 'flex';
        textGroupContainer.style.flexDirection = 'row';
        textGroupContainer.style.justifyContent = 'center';
        textGroupContainer.style.alignItems = 'center';
        textGroupContainer.style.width = '100%';
        textGroupContainer.style.gap = `${config.settings.spacing}px`;

        config.settings.characters.forEach((char, charIndex) => {
            let charElement = textGroupContainer.children[charIndex];
            if (!charElement) {
                charElement = document.createElement('div');
                charElement.className = 'dynamic-text-char';
                textGroupContainer.appendChild(charElement);
            }

            const isSelected = selectedBeats.has(char.dotIndex + 1);
            charElement.textContent = isSelected ? char.selectedChar : char.defaultChar;
            charElement.style.fontSize = `${textSize * 0.6}px`;
        });
    }


    // _updateNumberTextGimmick関数を更新
_updateNumberTextGimmick(element, config, containerSize) {
    const scaleFactor = containerSize / 400;
    const fontSize = config.settings.size * 0.2 * scaleFactor;
    
    const container = element.querySelector('div');
    container.style.position = 'absolute';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.left = '0';
    container.style.top = '0';
    
    const words = element.querySelectorAll('.number-text-word');
    const currentBeat = Math.floor(currentBeatProgress) + 1;
    
    words.forEach((wordElement, wordIndex) => {
        const wordConfig = config.settings.words[wordIndex];
        
        wordElement.style.position = 'absolute';
        wordElement.style.left = `${wordConfig.x}%`;
        wordElement.style.top = `${wordConfig.y}%`;
        wordElement.style.transform = 'translate(-50%, -50%)';
        wordElement.style.width = 'auto';
        wordElement.style.whiteSpace = 'nowrap';
        
        // 文字のスタイルを設定
        const chars = wordElement.querySelectorAll('.number-text-char');
        chars.forEach((charElement, charIndex) => {
            charElement.style.fontSize = `${fontSize}px`;
            charElement.style.fontFamily = "'M PLUS Rounded 1c', sans-serif";
            charElement.style.display = 'inline-block';
            charElement.style.minWidth = `${fontSize}px`;
            charElement.style.textAlign = 'center';
            charElement.style.fontWeight = 'bold';
            
                // 文字の色を設定（ワードごとに色を変えられるように）
                if (wordConfig.color) {
                    charElement.style.color = wordConfig.color;
                }
                
                // specialChar が配列形式の場合（ステージ8向け）
                if (Array.isArray(wordConfig.specialChar)) {
                    // 配列内で該当するインデックスの設定を探す
                    const specialCharConfig = wordConfig.specialChar.find(config => config.index === charIndex);
                    
                    if (specialCharConfig) {
                        // 対応するリズムドットの拍番号（文字のインデックス+1）
                        const lineIndex = wordConfig.lineIndex !== undefined ? wordConfig.lineIndex : 0;
                        const beatNumber = charIndex + 1;
                        const beatKey = `${lineIndex}-${beatNumber}`;
                        
                        // リズムドットが選択されているかチェック
                        const isSelected = selectedBeats.has(beatKey);
                        
                        // 選択状態に応じてO/Xを表示
                        charElement.textContent = isSelected ? 
                            specialCharConfig.selected : 
                            specialCharConfig.default;
                    } else {
                        // 通常の文字はそのまま表示
                        const originalChar = wordConfig.text[charIndex];
                        if (originalChar !== '#') {
                            charElement.textContent = originalChar;
                        }
                    }
                } 
                // 旧形式のspecialChar（オブジェクト形式）対応（後方互換性のため）
                else if (wordConfig.specialChar && wordConfig.specialChar.index === charIndex) {
                // wordIndex + 1 が対応する拍番号
                const beatNumber = wordIndex + 1;
                
                if (beatNumber < currentBeat || (beatNumber === currentBeat && lastBeat === currentBeat)) {
                    // この拍が既に過ぎている場合
                    const wasSelected = selectedBeats.has(beatNumber);
                    charElement.textContent = wasSelected ? 
                        wordConfig.specialChar.selected : 
                        wordConfig.specialChar.default;
                } else {
                    // この拍がまだ来ていない、または現在進行中の場合
                    charElement.textContent = '#';
                }
            } else {
                // # でない普通の文字はそのまま表示
                const originalChar = wordConfig.text[charIndex];
                if (originalChar !== '#') {
                    charElement.textContent = originalChar;
                }
            }
        });
    });
}

    _updateDotCounterGimmick(element, config, size) {
        const counterContainer = element.querySelector('div');
        if (counterContainer) {
            const fontSize = size * 0.5;
            counterContainer.style.fontSize = `${fontSize}px`;
            counterContainer.style.color = '#333';
            counterContainer.style.lineHeight = '1';
            counterContainer.style.textAlign = 'center';
            counterContainer.style.fontFamily = "'M PLUS Rounded 1c', sans-serif";
            counterContainer.style.display = 'flex';
            counterContainer.style.justifyContent = 'center';
            counterContainer.style.alignItems = 'center';

            const dotCount = this._countSelectedDotsInRange(
                config.settings.startBeat,
                config.settings.endBeat
            );

            counterContainer.textContent = this._generateDotCounterText(
                dotCount,
                config.settings.baseNumber
            );
        }
    }
    
    _updateClickCounterGimmick(element, config, size) {
        // クリックカウンターの更新処理
        const container = element.querySelector('div');
        if (container) {
            container.textContent = config.settings.prefix + clickCounts.getTotal() + config.settings.suffix;
            container.style.fontSize = `${size / 10}px`;
            container.style.fontFamily = "'M PLUS Rounded 1c', sans-serif";
            container.style.fontWeight = "bold";
            container.style.color = config.settings.color || "#FFFFFF";
        }
    }

    _updateRhythmLinesGimmick(element, config, containerSize) {
        const svg = element.querySelector('svg');
        if (!svg) return;
        
        const linesGroup = svg.querySelector('.rhythm-lines-group');
        if (!linesGroup) return;
        
        const lines = linesGroup.querySelectorAll('.rhythm-line');
        const containerScaleFactor = containerSize / 400;
        
        // スケールファクターを取得（デフォルトは1.0）
        const scaleFactor = config.settings.scaleFactor || 1.0;
        
        // SVGのビューボックスを設定（全体サイズの調整）
        svg.setAttribute('viewBox', '0 0 100 100');
        
        // 現在のビート位置を取得（1～8）
        const dotCount = stageSettings[currentStage]?.dots || 8;
        const currentBeatProgress = (currentTime * BEATS_PER_SECOND) % dotCount;
        const currentBeat = Math.floor(currentBeatProgress) + 1;
        
        // 前回のビートと異なる場合に新しい線を表示
        if (currentBeat !== this.lastBeat) {
            // ビートが1に戻ったらリセット
            if (currentBeat === 1 && this.lastBeat > 1) {
                // 全ての線をリセット
                lines.forEach(line => {
                    line.style.opacity = '0';
                });
                
                // 表示済み線の配列をクリア
                this.displayedLines = [];
            }
            
            // 現在のビートに該当する全ての線を表示
            const linesToShow = [];
            config.settings.lines.forEach((lineConfig, index) => {
                if (lineConfig.beat === currentBeat) {
                    linesToShow.push({ index, config: lineConfig });
                }
            });
            
            // 該当する全ての線を表示
            linesToShow.forEach(({ index, config: lineConfig }) => {
                const line = lines[index];
                if (line) {
                    // 中心点を基準にスケーリング
                    const centerX = 50;
                    const centerY = 50;
                    
                    // 座標をスケーリング（中心点からの距離にスケールファクターを適用）
                    const x1 = centerX + (lineConfig.x1 - centerX) * scaleFactor;
                    const y1 = centerY + (lineConfig.y1 - centerY) * scaleFactor;
                    const x2 = centerX + (lineConfig.x2 - centerX) * scaleFactor;
                    const y2 = centerY + (lineConfig.y2 - centerY) * scaleFactor;
                    
                    // 線の位置・スタイルを設定
                    line.setAttribute('x1', `${x1}%`);
                    line.setAttribute('y1', `${y1}%`);
                    line.setAttribute('x2', `${x2}%`);
                    line.setAttribute('y2', `${y2}%`);
                    
                    // 線のスタイル設定
                    line.style.stroke = lineConfig.color || config.settings.color || '#FFFFFF';
                    
                    // 線の幅を計算
                    // 1. 設定でのデフォルト線幅を取得
                    const defaultLineWidth = config.settings.lineWidth || 4;
                    // 2. 個別の線の幅の指定があればそれを使用、なければデフォルト値
                    const specifiedWidth = lineConfig.width !== undefined ? lineConfig.width : defaultLineWidth;
                    // 3. 線幅をコンテナサイズに合わせてスケーリング
                    const scaledWidth = specifiedWidth * containerScaleFactor;
                    
                    line.style.strokeWidth = `${scaledWidth}px`;
                    line.style.opacity = '1';
                    line.style.strokeLinecap = 'round'; // 線の端を丸くする
                    
                    // 表示済みリストに追加
                    if (!this.displayedLines) {
                        this.displayedLines = [];
                    }
                    this.displayedLines.push(index);
                }
            });
            
            // 現在のビートを記録
            this.lastBeat = currentBeat;
        }
        
        // すでに表示している線は維持
        if (this.displayedLines && this.displayedLines.length > 0) {
            this.displayedLines.forEach(lineIndex => {
                const line = lines[lineIndex];
                if (line) {
                    line.style.opacity = '1';
                }
            });
        }
    }
    
    // SYMBOL_GRIDギミックの作成
    _createSymbolGridElement(element, config) {
        const container = document.createElement('div');
        container.className = 'symbol-grid-container';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        
        // 各行（ライン）のシンボルを作成
        config.settings.rows.forEach((row, rowIndex) => {
            // 新形式（位置指定あり）
            if (Array.isArray(row.symbols)) {
                row.symbols.forEach((symbol, symbolIndex) => {
                    const symbolContainer = document.createElement('div');
                    symbolContainer.className = 'symbol-container';
                    symbolContainer.setAttribute('data-row', rowIndex);
                    symbolContainer.setAttribute('data-beat', symbol.beatNumber);
                    
                    // シンボルのサイズを設定（個別指定または全体のデフォルト値）
                    const symbolSize = symbol.size !== undefined ? symbol.size : config.settings.symbolSize;
                    symbolContainer.setAttribute('data-size', symbolSize);
                    
                    // 線の太さを設定（個別指定または全体のデフォルト値）
                    const strokeWidth = symbol.strokeWidth !== undefined ? symbol.strokeWidth : (config.settings.strokeWidth || 3);
                    symbolContainer.setAttribute('data-stroke-width', strokeWidth);
                    
                    symbolContainer.style.position = 'absolute';
                    symbolContainer.style.left = `${symbol.x}%`;
                    symbolContainer.style.top = `${symbol.y}%`;
                    symbolContainer.style.transform = 'translate(-50%, -50%)';
                    
                    // SVG要素を作成（○×を描画するため）
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    svg.style.position = 'absolute';
                    svg.style.top = '0';
                    svg.style.left = '0';
                    
                    // 円（○）の描画
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', '50%');
                    circle.setAttribute('cy', '50%');
                    circle.setAttribute('r', '30%');
                    circle.setAttribute('fill', 'none');
                    circle.setAttribute('stroke-width', strokeWidth);
                    circle.setAttribute('stroke', row.color || '#000');
                    circle.classList.add('symbol-circle');
                    circle.style.opacity = '0'; // 初期状態は非表示
                    svg.appendChild(circle);
                    
                    // ×印の描画（2本の斜線）
                    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line1.setAttribute('x1', '25%');
                    line1.setAttribute('y1', '25%');
                    line1.setAttribute('x2', '75%');
                    line1.setAttribute('y2', '75%');
                    line1.setAttribute('stroke', row.color || '#000');
                    line1.setAttribute('stroke-width', strokeWidth);
                    line1.classList.add('symbol-cross-line');
                    line1.style.opacity = '1'; // 初期状態は表示
                    svg.appendChild(line1);
                    
                    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line2.setAttribute('x1', '75%');
                    line2.setAttribute('y1', '25%');
                    line2.setAttribute('x2', '25%');
                    line2.setAttribute('y2', '75%');
                    line2.setAttribute('stroke', row.color || '#000');
                    line2.setAttribute('stroke-width', strokeWidth);
                    line2.classList.add('symbol-cross-line');
                    line2.style.opacity = '1'; // 初期状態は表示
                    svg.appendChild(line2);
                    
                    symbolContainer.appendChild(svg);
                    container.appendChild(symbolContainer);
                });
            } 
            // 旧形式（横並び）- 後方互換性のため
            else if (typeof row.symbols === 'number') {
                const rowContainer = document.createElement('div');
                rowContainer.className = 'symbol-grid-row';
                rowContainer.setAttribute('data-row-index', rowIndex);
                rowContainer.style.display = 'flex';
                rowContainer.style.justifyContent = 'center';
                rowContainer.style.alignItems = 'center';
                rowContainer.style.margin = '10px 0';
                
                // 各セル（記号）のコンテナを作成
                for (let i = 0; i < row.symbols; i++) {
                    const symbolContainer = document.createElement('div');
                    symbolContainer.className = 'symbol-container';
                    symbolContainer.setAttribute('data-row', rowIndex);
                    symbolContainer.setAttribute('data-col', i);
                    symbolContainer.style.margin = '0 10px';
                    symbolContainer.style.position = 'relative';
                    
                    // SVG要素を作成（○×を描画するため）
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    svg.style.position = 'absolute';
                    svg.style.top = '0';
                    svg.style.left = '0';
                    
                    // 円（○）の描画
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', '50%');
                    circle.setAttribute('cy', '50%');
                    circle.setAttribute('r', '40%');
                    circle.setAttribute('fill', 'none');
                    circle.setAttribute('stroke-width', strokeWidth);
                    circle.setAttribute('stroke', row.color || '#000');
                    circle.classList.add('symbol-circle');
                    circle.style.opacity = '0'; // 初期状態は非表示
                    svg.appendChild(circle);
                    
                    // ×印の描画（2本の斜線）
                    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line1.setAttribute('x1', '25%');
                    line1.setAttribute('y1', '25%');
                    line1.setAttribute('x2', '75%');
                    line1.setAttribute('y2', '75%');
                    line1.setAttribute('stroke', row.color || '#000');
                    line1.setAttribute('stroke-width', strokeWidth);
                    line1.classList.add('symbol-cross-line');
                    line1.style.opacity = '1'; // 初期状態は表示
                    svg.appendChild(line1);
                    
                    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line2.setAttribute('x1', '75%');
                    line2.setAttribute('y1', '25%');
                    line2.setAttribute('x2', '25%');
                    line2.setAttribute('y2', '75%');
                    line2.setAttribute('stroke', row.color || '#000');
                    line2.setAttribute('stroke-width', strokeWidth);
                    line2.classList.add('symbol-cross-line');
                    line2.style.opacity = '1'; // 初期状態は表示
                    svg.appendChild(line2);
                    
                    symbolContainer.appendChild(svg);
                    rowContainer.appendChild(symbolContainer);
                }
                
                container.appendChild(rowContainer);
            }
        });
        
        element.appendChild(container);
    }
    
    // SYMBOL_GRIDギミックの更新
    _updateSymbolGridGimmick(element, config, containerSize) {
        const scaleFactor = containerSize / 400;
        const defaultSymbolSize = config.settings.symbolSize * scaleFactor || 30 * scaleFactor;
        
        // 各シンボルコンテナのサイズを設定
        const symbolContainers = element.querySelectorAll('.symbol-container');
        symbolContainers.forEach(container => {
            // 個別のサイズ設定があればそれを使用、なければデフォルト値
            let symbolSize = defaultSymbolSize;
            if (container.hasAttribute('data-size')) {
                const sizeValue = parseInt(container.getAttribute('data-size'));
                symbolSize = sizeValue * scaleFactor;
            }
            
            container.style.width = `${symbolSize}px`;
            container.style.height = `${symbolSize}px`;
            
            const rowIndex = parseInt(container.getAttribute('data-row'));
            
            // 新形式：位置指定あり
            if (container.hasAttribute('data-beat')) {
                const beatNumber = parseInt(container.getAttribute('data-beat'));
                
                // リズムドット列の行番号を取得
                const lineIndex = rowIndex;
                // 選択キーを作成
                const beatKey = `${lineIndex}-${beatNumber}`;
                
                // 選択状態に応じて○×を表示
                const isSelected = selectedBeats.has(beatKey);
                const circle = container.querySelector('.symbol-circle');
                const crossLines = container.querySelectorAll('.symbol-cross-line');
                
                if (isSelected) {
                    // ○を表示、×を非表示
                    circle.style.opacity = '1';
                    crossLines.forEach(line => {
                        line.style.opacity = '0';
                    });
                } else {
                    // ×を表示、○を非表示
                    circle.style.opacity = '0';
                    crossLines.forEach(line => {
                        line.style.opacity = '1';
                    });
                }
            }
            // 旧形式：行と列で指定
            else if (container.hasAttribute('data-col')) {
                // 旧形式：列形式
                const colIndex = parseInt(container.getAttribute('data-col'));
                
                // ビート番号を計算
                const beatNumber = colIndex + 1;
                
                // リズムドット列の行番号を取得
                const lineIndex = rowIndex;
                // 選択キーを作成
                const beatKey = `${lineIndex}-${beatNumber}`;
                
                // 選択状態に応じて○×を表示
                const isSelected = selectedBeats.has(beatKey);
                const circle = container.querySelector('.symbol-circle');
                const crossLines = container.querySelectorAll('.symbol-cross-line');
                
                if (isSelected) {
                    // ○を表示、×を非表示
                    circle.style.opacity = '1';
                    crossLines.forEach(line => {
                        line.style.opacity = '0';
                    });
                } else {
                    // ×を表示、○を非表示
                    circle.style.opacity = '0';
                    crossLines.forEach(line => {
                        line.style.opacity = '1';
                    });
                }
            }
            
            // 線の太さを設定
            if (container.hasAttribute('data-stroke-width')) {
                const strokeWidth = parseInt(container.getAttribute('data-stroke-width')) * scaleFactor;
                const circle = container.querySelector('.symbol-circle');
                const crossLines = container.querySelectorAll('.symbol-cross-line');
                
                circle.setAttribute('stroke-width', strokeWidth);
                crossLines.forEach(line => {
                    line.setAttribute('stroke-width', strokeWidth);
                });
            }
        });
    }
    
    _updateRhythmDotsGimmick(element, config, containerSize) {
        const dots = element.querySelectorAll('.rhythm-dot-in-puzzle');
        const scaleFactor = containerSize / 400;
        const currentBeat = Math.floor(currentBeatProgress) + 1;
    
        const container = element.querySelector('div');
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.top = '0';
        container.style.left = '0';
    
        dots.forEach((dot, index) => {
            const dotConfig = config.settings.dots[index];
            const beatNumber = dotConfig.beat;  // 配列のインデックスではなく、beatプロパティを使用
    
            const scaledSize = (dotConfig.size || 20) * scaleFactor;
            dot.style.width = `${scaledSize}px`;
            dot.style.height = `${scaledSize}px`;
            dot.style.left = `${dotConfig.x}%`;
            dot.style.top = `${dotConfig.y}%`;
            
            // プレイヤーの選択に応じて反応させる
            let isSelected = false;
            
            // ステージ5の場合は特別な処理（各色のドットは対応するプレイヤーのみ反応）
            if (currentStage === 5) {
                // ギミックインデックスで色を判断（0:赤、1:青、2:緑）
                const gimmickIndex = parseInt(element.id.split('-')[2]);
                
                // 対応するラインからの入力のみをチェック
                if (gimmickIndex >= 0 && gimmickIndex <= 2) {
                    // selectedBeatsから該当するラインのみの入力をチェック
                    isSelected = Array.from(selectedBeats).some(key => {
                        const [lineIndex, beatPart] = key.split('-').map(Number);
                        return lineIndex === gimmickIndex && beatPart === beatNumber;
                    });
                }

                // ステージ5のドットは四角形に設定し、変形なし
                dot.style.borderRadius = '0%'; // 四角形
                dot.style.transform = 'translate(-50%, -50%)'; // 拡大縮小なし
            } 
            // ステージ6の場合の特別処理
            else if (currentStage === 6) {
                // ギミックインデックスで色を判断（0:赤、1:青、2:緑）
                const gimmickIndex = parseInt(element.id.split('-')[2]);
                
                // 対応するラインからの入力のみをチェック
                if (gimmickIndex >= 0 && gimmickIndex <= 2) {
                    // selectedBeatsから該当するラインのみの入力をチェック
                    isSelected = Array.from(selectedBeats).some(key => {
                        const [lineIndex, beatPart] = key.split('-').map(Number);
                        return lineIndex === gimmickIndex && beatPart === beatNumber;
                    });
                }

                dot.style.borderRadius = '50%'; // 円形
                dot.style.transform = 'translate(-50%, -50%) scale(1)'; // 通常サイズ
            }
            else {
                // 他のステージではこれまで通りの処理
                isSelected = Array.from(selectedBeats).some(key => {
                    const beatPart = parseInt(key.split('-')[1]);
                    return beatPart === beatNumber;
                });
                
                // 他のステージのドットは丸形
                dot.style.borderRadius = '50%'; // 円形
                dot.style.transform = 'translate(-50%, -50%) scale(1)'; // 通常サイズ
            }
            
            const isCurrentBeat = (beatNumber === currentBeat);
            
            // ドットの色を設定から取得（設定されていない場合は白をデフォルトとする）
            const dotColor = config.settings.color || '#FFFFFF';
            
            // デフォルトスタイル設定
            // ステージ6の場合は、初期状態は白色
            if (currentStage === 6) {
                dot.style.backgroundColor = '#FFFFFF'; // 常に白色
                dot.style.opacity = '1.0'; // 完全不透明
                dot.style.transition = 'all 0.05s linear'; // より速い遷移
                dot.style.border = '3px solid #222'; // より太い枠線、より暗い色
            } else {
                dot.style.backgroundColor = dotColor; // 設定された色
                dot.style.opacity = '0.8';
                dot.style.transition = 'all 0.1s ease';
                dot.style.border = '2px solid #333';
            }
            
            // その他のスタイル
            dot.style.boxShadow = 'none';
            // transformは上で設定済み
            
            // 現在のビートのドットをハイライト
            if (isCurrentBeat) {
                if (currentStage !== 5 && currentStage !== 6) {
                    // ステージ5と6以外の場合のみ拡大効果
                    dot.style.transform = 'translate(-50%, -50%) scale(1.2)';
                }
                dot.style.opacity = '1';
                
                if (currentStage === 6) {
                    dot.style.boxShadow = `0 0 8px ${dotColor}`; // より強いグロー効果
                } else {
                    dot.style.boxShadow = `0 0 5px ${dotColor}`;
                }
            }
            
            // 選択されたドットは最優先で強調表示
            if (isSelected) {
                // ステージ6の場合は選択時に担当色に変更、他は黒色に
                if (currentStage === 6) {
                    dot.style.backgroundColor = dotColor; // 担当の色に変更
                    dot.style.opacity = '1'; // 完全不透明
                    dot.style.boxShadow = `0 0 12px ${dotColor}, 0 0 5px #FFFFFF`; // 強いグロー効果
                    dot.style.border = `3px solid #222`; // 黒い太い境界線
                } else {
                    dot.style.backgroundColor = '#000000'; // 黒色
                    dot.style.opacity = '1';
                    dot.style.boxShadow = `0 0 10px ${dotColor}`;
                    dot.style.border = `2px solid ${dotColor}`;
                }
                
                if (currentStage !== 5 && currentStage !== 6) {
                    // ステージ5と6以外の場合のみ拡大効果
                    dot.style.transform = 'translate(-50%, -50%) scale(1.3)';
                }
            }
        });
    }

    _updateJubeatGridGimmick(element, config, containerSize) {
        const scaleFactor = containerSize / 400;
        const currentBeatProgress = (currentTime * BEATS_PER_SECOND) % (stageSettings[currentStage]?.dots || 4);
        const currentBeat = Math.floor(currentBeatProgress) + 1;
        
        const gridContainer = element.querySelector('.jubeat-grid-container');
        if (!gridContainer) return;
        
        // パネルサイズと間隔を調整
        const gapSize = 6 * scaleFactor;
        gridContainer.style.gap = `${gapSize}px`;
        
        // アニメーション設定の取得
        const animationConfig = config.settings.animation || {
            sequenceMode: "position", 
            delayStep: 0.15          
        };
        
        // すべてのパネルを更新
        const panels = gridContainer.querySelectorAll('.jubeat-panel');
        panels.forEach(panel => {
            const row = parseInt(panel.getAttribute('data-row'));
            const col = parseInt(panel.getAttribute('data-col'));
            
            // パネルのデフォルトスタイル - ステージ4の場合は白黒配色に変更
            if (currentStage === 4) {
                panel.style.backgroundColor = '#FFFFFF'; // デフォルトを純白に
                panel.style.border = '1px solid #000000'; // 黒い境界線を追加
                panel.style.boxShadow = 'none'; // 影を削除
                panel.style.transition = 'background-color 0.05s linear, transform 0.05s linear'; // 安定した遷移のために短いトランジション
                panel.style.transform = 'scale(1)'; // デフォルトサイズ
            } else {
                panel.style.backgroundColor = 'rgba(15, 15, 20, 0.95)';
            }
            
            const glow = panel.querySelector('.jubeat-panel-glow');
            
            // この行と列に対応するパネルの設定を見つける
            let matchingPanels = config.settings.panels.filter(p => p.row === row && p.col === col);
            
            // マッチするパネルがない場合
            if (matchingPanels.length === 0) {
                // データがないパネルは無効
                if (glow) glow.style.opacity = '0';
                panel.classList.remove('active');
                return;
            }
            
            // 現在のビート進行に対応するパネル設定を見つける
            let activePanelConfig = null;
            let wasJustActivated = false;
            
            // カスタムタイミングモードでの処理
            if (animationConfig.sequenceMode === "custom") {
                for (let panelConfig of matchingPanels) {
                    const startBeat = panelConfig.startBeat || panelConfig.beat || 0;
                    const endBeat = panelConfig.endBeat || (startBeat + 1.0);
                    
                    // 拍の整数部分と小数部分を考慮して現在位置を計算
                    const currentPosition = currentBeatProgress + 1;
                    
                    // パネルがアクティブかどうかチェック
                    if (currentPosition >= startBeat && currentPosition < endBeat) {
                        activePanelConfig = panelConfig;
                        // ステージ4ではアニメーション開始チェックを省略（ちらつき防止）
                        wasJustActivated = currentStage !== 4 && (currentPosition >= startBeat && currentPosition < startBeat + 0.15);
                        break;
                    }
                }
            } else {
                // 従来のモード処理（beat値を基準にした点灯）
                activePanelConfig = matchingPanels.find(p => {
                    const beatNumber = p.beat || 0;
                    return beatNumber === currentBeat;
                });
            }
            
            // パネルのスタイル更新
            const isSelected = selectedBeats.has(currentBeat);
            
            if (activePanelConfig) {
                // アクティブなパネル
                if (wasJustActivated && currentStage !== 4) {
                    // リセットしてから再アニメーション（ステージ4以外）
                    panel.classList.remove('active');
                    setTimeout(() => {
                        panel.classList.add('active');
                    }, 10);
                } else if (!panel.classList.contains('active')) {
                    panel.classList.add('active');
                }
                
                if (currentStage === 4) {
                    // ステージ4の場合は配色を反転: アクティブパネルは純黒に
                    panel.style.backgroundColor = '#1A1A1A'; // 純黒の90%濃度
                    panel.style.border = '1px solid #FFFFFF'; // 白い境界線
                    panel.style.boxShadow = 'none'; // 影を削除
                    
                    // ステージ4ではアニメーションなし、CSSクラスのみで制御
                    panel.style.animation = 'none';
                    panel.style.transition = 'background-color 0.05s linear, transform 0.05s linear'; // 短い遷移時間で安定した表示に
                    panel.style.transform = 'scale(0.96)'; // 点灯時には少し小さく表示
                } else {
                    panel.style.backgroundColor = isSelected ? 'rgba(250, 250, 250, 0.95)' : 'rgba(230, 230, 230, 0.9)';
                }
                
                // グロー効果の更新
                if (glow) {
                    if (currentStage === 4) {
                        // ステージ4ではグロー効果を非表示
                        glow.style.opacity = '0';
                    } else {
                        // 他のステージは元の設定
                        glow.style.opacity = '1';
                        if (isSelected) {
                            glow.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.9) 20%, rgba(240, 240, 240, 0.7) 40%, rgba(220, 220, 220, 0.4) 70%, transparent 90%)';
                            glow.style.filter = 'brightness(1.4) contrast(1.3)';
                        } else {
                            glow.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 240, 0.85) 20%, rgba(220, 220, 220, 0.6) 40%, rgba(180, 180, 180, 0.3) 70%, transparent 90%)';
                            glow.style.filter = 'brightness(1.2) contrast(1.1)';
                        }
                    }
                }
            } else {
                // 非アクティブなパネル
                panel.classList.remove('active');
                
                if (currentStage === 4) {
                    // ステージ4の場合は配色を反転: 非アクティブパネルは純白に
                    panel.style.backgroundColor = '#FFFFFF';
                    panel.style.border = '1px solid #000000'; // 黒い境界線
                    panel.style.boxShadow = 'none'; // 影を削除
                    panel.style.transform = 'scale(1)'; // 非アクティブ時は通常サイズ
                } else {
                    panel.style.backgroundColor = isSelected ? 'rgba(40, 40, 40, 0.8)' : 'rgba(10, 10, 10, 0.95)';
                }
                
                // エフェクトをオフ
                if (glow) {
                    glow.style.opacity = '0'; // ステージ4では常にグロー効果オフ
                }
            }
        });
        
        // CSSアニメーションが存在しない場合は追加
        if (!document.getElementById('jubeat-animations')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'jubeat-animations';
            styleSheet.innerHTML = `
                @keyframes jubeatPulse {
                    0% { 
                        opacity: 0.9; 
                        transform: scale(0.98);
                        filter: blur(3px) brightness(1.2) contrast(1.4);
                    }
                    50% {
                        opacity: 0.95;
                        transform: scale(1.01);
                        filter: blur(1px) brightness(1.3) contrast(1.3);
                    }
                    100% { 
                        opacity: 1; 
                        transform: scale(1.03);
                        filter: blur(0px) brightness(1.4) contrast(1.5);
                    }
                }
                
                /* ステージ4用のシンプルで安定した表示スタイル */
                .stage-4 .jubeat-panel.active {
                    animation: none !important;
                    transition: background-color 0.05s linear, transform 0.05s linear !important;
                    will-change: auto !important;
                    transform: scale(0.96) !important;
                    background-color: #1A1A1A !important; /* 純黒の90%濃度 */
                }
                
                .stage-4 .jubeat-panel {
                    border: 1px solid #000000 !important;
                    transition: background-color 0.05s linear, transform 0.05s linear !important;
                    will-change: auto !important;
                    transform: scale(1) !important;
                }
                
                .stage-4 .jubeat-panel.active {
                    border: 1px solid #FFFFFF !important;
                }
                
                @keyframes jubeatRipple {
                    0% {
                        transform: scale(0.3);
                        opacity: 0.95;
                        box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
                    }
                    50% {
                        opacity: 0.7;
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                        box-shadow: 0 0 0 rgba(255, 255, 255, 0);
                    }
                }
                
                /* ステージ4用のリップルを非表示 */
                .stage-4 .jubeat-panel-ripple {
                    display: none !important;
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }

    updateGimmick(stageId, currentTime = 0) {
        const config = STAGE_CONFIGS[stageId];
        
        if (!config) return;
        
        // 各ギミックを処理
        config.gimmicks.forEach((gimmickConfig, index) => {
            let element = this.elements.get(`${stageId}-${index}`);
            
            // 要素がなければ作成
            if (!element) {
                element = this.createGimmickElement(stageId, index);
                if (!element) return;
            }
            
            const containerSize = Math.min(problemArea.clientWidth, problemArea.clientHeight);
            const scaleFactor = containerSize / 400;
            const size = gimmickConfig.settings.size * scaleFactor;
            
            // 基本的なスタイル設定
            if (gimmickConfig.type !== GIMMICK_TYPES.WALL_IMAGE) {
                element.style.width = `${size}px`;
                element.style.height = `${size}px`;
                element.style.left = `${gimmickConfig.settings.x}%`;
                element.style.top = `${gimmickConfig.settings.y}%`;
                element.style.transform = 'translate(-50%, -50%)';
                
                // z-indexがある場合は適用
                if (gimmickConfig.settings.zIndex !== undefined) {
                    element.style.zIndex = gimmickConfig.settings.zIndex;
                }
            } else {
                element.style.width = '100%';
                element.style.height = '100%';
                element.style.left = '0';
                element.style.top = '0';
                element.style.transform = 'none';
            }

            // タイマーとひらがなのスタイル設定
            if (gimmickConfig.type === GIMMICK_TYPES.TIMER || 
                gimmickConfig.type === GIMMICK_TYPES.HIRAGANA) {
                this._setupTextStyles(element, size);
            }
            
            // 各ギミックタイプの更新処理
            switch (gimmickConfig.type) {
                case GIMMICK_TYPES.TIMER:
                    this._updateTimerGimmick(element, currentTime);
                    break;

                case GIMMICK_TYPES.HIRAGANA:
                    this._updateHiraganaGimmick(element, gimmickConfig, currentTime);
                    break;

                case GIMMICK_TYPES.IMAGE_SEQUENCE:
                    this._updateImageSequenceGimmick(element, gimmickConfig, currentTime);
                    break;

                case GIMMICK_TYPES.WALL_IMAGE:
                    this._updateWallImageGimmick(element, gimmickConfig);
                    break;

                case GIMMICK_TYPES.DYNAMIC_TEXT_GROUP:
                    this._updateDynamicTextGroupGimmick(element, gimmickConfig, size, scaleFactor);
                    break;

                case GIMMICK_TYPES.DOT_COUNTER:
                    this._updateDotCounterGimmick(element, gimmickConfig, size);
                    break;

                case GIMMICK_TYPES.RHYTHM_DOTS:
                    this._updateRhythmDotsGimmick(element, gimmickConfig, containerSize);
                    break;
                    
                case GIMMICK_TYPES.RHYTHM_LINES:
                    this._updateRhythmLinesGimmick(element, gimmickConfig, containerSize);
                    break;
                    
                case GIMMICK_TYPES.JUBEAT_GRID:
                    this._updateJubeatGridGimmick(element, gimmickConfig, containerSize);
                    break;

                case GIMMICK_TYPES.SEGMENT:
                    // セグメント表示の実装（必要に応じて）
                    break;

                case GIMMICK_TYPES.NUMBER_TEXT:
                    this._updateNumberTextGimmick(element, gimmickConfig, containerSize);
                    break;

                case GIMMICK_TYPES.CLICK_COUNTER:
                    this._updateClickCounterGimmick(element, gimmickConfig, size);
                    break;
                    
                case GIMMICK_TYPES.SYMBOL_GRID:
                    this._updateSymbolGridGimmick(element, gimmickConfig, containerSize);
                    break;
            }
        });
        
        // ステージ7の場合は結果ボックスを更新
        if (stageId === 7) {
            this._updateResultBox();
        }
    }
    
    // 結果ボックスの更新関数
    _updateResultBox() {
        const resultBox = document.getElementById('stageResults');
        if (!resultBox) return;
        
        // ステージ7の場合は専用の処理に任せる
        if (currentStage === 7) {
            // パターン検出用のブロックだけ初期表示
            if (selectedBeats.size === 0) {
                // 初期状態の表示（「＊＊＊」のみ）
                resultBox.innerHTML = `
                    <div class="result-char-container">
                        <div class="result-char-box">＊</div>
                        <div class="result-char-box">＊</div>
                        <div class="result-char-box">＊</div>
                    </div>
                `;
            }
            return;
        }
        
        // このステージでの結果を表示
        // スタイリッシュなデザインのレイアウト
        resultBox.innerHTML = `
            <div class="result-item">
                <div class="result-header">
                    <div class="result-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="result-title">解析結果</div>
                </div>
                <div class="result-content">
                    <div class="result-data">
                        <div class="data-label">状態</div>
                        <div class="data-value">解析中...</div>
                    </div>
                    <div class="progress-line">
                        <div class="progress-inner" style="width: 65%;"></div>
                    </div>
                </div>
            </div>
            
            <div class="result-item">
                <div class="result-header">
                    <div class="result-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="result-title">ステータス</div>
                </div>
                <div class="result-content">
                    <div class="result-status">
                        <span class="status-dot active"></span>
                        <span class="status-text">アクティブ</span>
                    </div>
                </div>
            </div>
        `;
        
        // 結果ボックスのスタイルを追加
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .result-item {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            
            .result-header {
                display: flex;
                align-items: center;
                padding: 12px 15px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .result-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 10px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .result-title {
                font-size: 14px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .result-content {
                padding: 15px;
            }
            
            .result-data {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            
            .data-label {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
            }
            
            .data-value {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
            }
            
            .progress-line {
                height: 4px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 2px;
                overflow: hidden;
            }
            
            .progress-inner {
                height: 100%;
                background: linear-gradient(90deg, #2C5364, #203A43);
                border-radius: 2px;
                transition: width 0.5s ease-out;
            }
            
            .result-status {
                display: flex;
                align-items: center;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 8px;
                background: rgba(255, 255, 255, 0.3);
            }
            
            .status-dot.active {
                background: #4caf50;
                box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
            }
            
            .status-text {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.9);
            }
        `;
        
        // すでに同じstyleElementがあれば削除
        const existingStyle = document.getElementById('result-box-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        styleEl.id = 'result-box-styles';
        document.head.appendChild(styleEl);
    }

    hideAllExcept(currentStageId) {
        this.elements.forEach((element, key) => {
            const [stageId] = key.split('-');
            element.style.display = parseInt(stageId) === currentStageId ? 'block' : 'none';
        });
    }

    reset() {
        this.activeWallImages.forEach(img => img.remove());
        this.activeWallImages.clear();
    }
}
//====================================================
// ユーティリティ関数
//====================================================
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updatePuzzleImage() {
    let existingImage = problemArea.querySelector('.puzzle-image');
    if (existingImage) {
        existingImage.remove();
    }

    const imagePath = PUZZLE_IMAGES[currentStage];
    if (imagePath) {
        const imageElement = document.createElement('img');
        imageElement.src = imagePath;
        imageElement.className = 'puzzle-image';
        imageElement.alt = `Puzzle ${currentStage}`;
        problemArea.insertBefore(imageElement, problemArea.firstChild);
    }
}

//====================================================
// リズムドット関連の機能
//====================================================
function createRhythmDots() {
    const dotsContainer = document.getElementById('rhythmDots');
    if (!dotsContainer) return;

    // リズムドットの表示設定をチェック
    const showDots = RHYTHM_DOTS_VISIBILITY[currentStage];
    
    // 表示しない設定の場合はコンテナを非表示にして終了
    if (!showDots) {
        dotsContainer.style.display = 'none';
        return;
    } else {
        dotsContainer.style.display = 'flex';
    }

    dotsContainer.innerHTML = '';
    const dotCount = stageSettings[currentStage]?.dots || 4;
    
    // ステージに応じたライン数（ボタン数）を決定
    let lineCount = 1; // デフォルトは1行
    if (currentStage >= 13 && currentStage <= 16) {
        lineCount = 8; // 13-16ステージは8ライン
    } else if (currentStage >= 9) {
        lineCount = 4; // 9-12ステージは4ライン
    } else if (currentStage >= 5) {
        lineCount = 3; // 5-8ステージは3ライン
    } else {
        lineCount = 1; // 0-4ステージは1ライン
    }
    
    // ライン（ボタン）ごとにドット行を作成
    for (let line = 0; line < lineCount; line++) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'rhythm-dots';
        lineDiv.setAttribute('data-line-index', line);
        
        // 各ラインのドット数（全てのラインで同じ数のドットを使用）
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'rhythm-dot';
            
            // ドットのビート番号と行番号を設定
            const beatNumber = i + 1;
            dot.setAttribute('data-beat', beatNumber);
            dot.setAttribute('data-line', line);
            
            // クリア済みステージの場合、正解のドットを selected 状態で表示
            const linePattern = correctPatterns[currentStage]?.[line] || [];
            if (clearedStages.has(currentStage) && linePattern.includes(beatNumber)) {
                dot.classList.add('selected');
            }
            
            lineDiv.appendChild(dot);
        }
        
        dotsContainer.appendChild(lineDiv);
    }
}

function updateRhythmDots() {
    if (!isPlaying && !clearedStages.has(currentStage)) return;

    // ビートの進行と判定は常に実行（表示非表示に関わらず）
    const dotCount = stageSettings[currentStage]?.dots || 4;
    const oldBeat = lastBeat;
    currentBeatProgress = (currentTime * BEATS_PER_SECOND) % dotCount;
    const currentBeat = Math.floor(currentBeatProgress) + 1;

    // 前回と選択状態が変わったかどうかを追跡
    const previousSelectedBeats = new Set(selectedBeats);
    
    if (currentBeat < oldBeat) {
        checkRhythmPattern();
        selectedBeats.clear();
        isLoopComplete = true;
    } else {
        isLoopComplete = false;
    }

    lastBeat = currentBeat;

    // リズムドットの表示設定をチェック - 表示が無効の場合はUI更新をスキップ
    if (!RHYTHM_DOTS_VISIBILITY[currentStage]) return;

    const dotsContainer = document.getElementById('rhythmDots');
    if (!dotsContainer) return;

    // 全てのドットを更新
    const allLines = dotsContainer.querySelectorAll('.rhythm-dots');
    allLines.forEach((line) => {
        const lineIndex = parseInt(line.getAttribute('data-line-index'));
        const dots = line.querySelectorAll('.rhythm-dot');
        
        dots.forEach((dot) => {
            const beatNumber = parseInt(dot.getAttribute('data-beat'));
            const dotLine = parseInt(dot.getAttribute('data-line'));
            const beatKey = `${dotLine}-${beatNumber}`; // ライン番号とビート番号の組み合わせをキーにする
            const isCurrentBeat = beatNumber === currentBeat;
            const isSelected = selectedBeats.has(beatKey);
            
            // クリア済みステージの確認
            let isCorrectBeat = false;
            if (clearedStages.has(currentStage)) {
                const linePattern = correctPatterns[currentStage]?.[lineIndex] || [];
                isCorrectBeat = linePattern.includes(beatNumber);
            }

            // クリア済みステージの場合、正解のドットを常に selected 状態に
            if (isCorrectBeat) {
                dot.classList.add('selected');
            } else {
                dot.classList.toggle('active', isCurrentBeat);
                dot.classList.toggle('selected', isSelected);
            }
        });
    });
    
    // ステージ3の場合、選択状態に変更があればギミックを更新
    if (currentStage === 3) {
        // 前回と選択状態が異なるかチェック
        let selectionChanged = previousSelectedBeats.size !== selectedBeats.size;
        
        if (!selectionChanged) {
            // サイズが同じ場合、内容を比較
            for (const key of previousSelectedBeats) {
                if (!selectedBeats.has(key)) {
                    selectionChanged = true;
                    break;
                }
            }
        }
        
        if (selectionChanged) {
            // 選択状態が変わった場合は画像を更新
            gimmickManager.updateGimmick(currentStage);
        }
    }
}

function checkRhythmPattern() {
    if (currentStage === 16) {
        // ライン数をチェック
        let allLinesCorrect = true;
        
        // ライン0のみをチェック（このステージはまだ1ラインのみ）
        const lineIndex = 0;
        const pattern = correctPatterns[currentStage]?.[lineIndex] || [];
        if (!pattern || pattern.length === 0) {
            selectedBeats.clear();
            return;
        }
        
        const lineKeys = Array.from(selectedBeats)
            .filter(key => key.startsWith(`${lineIndex}-`))
            .map(key => parseInt(key.split('-')[1]));
            
        if (lineKeys.length !== pattern.length) {
            allLinesCorrect = false;
        } else {
            // パターンが一致するかチェック
            for (const beat of pattern) {
                if (!lineKeys.includes(beat)) {
                    allLinesCorrect = false;
                    break;
                }
            }
        }
        
        if (allLinesCorrect) {
            // クリック回数条件を削除し、常にクリアできるように
            clearedStages.add(currentStage);
            currentStage++;
            updateStageContent();
        }
        selectedBeats.clear();
        return;
    }

    // 通常ステージの判定
    // 利用可能なライン数を取得
    let availableLines = 1;
    if (currentStage >= 9) {
        availableLines = 4;
    } else if (currentStage >= 5) {
        availableLines = 3;
    }
    
    // 全てのラインが正解かチェック
    let allLinesCorrect = true;
    
    for (let lineIndex = 0; lineIndex < availableLines; lineIndex++) {
        // このラインの正解パターン
        const pattern = correctPatterns[currentStage]?.[lineIndex] || [];
        if (!pattern || pattern.length === 0) continue;
        
        // このラインで選択されたビート
        const lineKeys = Array.from(selectedBeats)
            .filter(key => key.startsWith(`${lineIndex}-`))
            .map(key => parseInt(key.split('-')[1]));
        
        // パターンの長さが一致するかチェック
        if (lineKeys.length !== pattern.length) {
            allLinesCorrect = false;
            break;
        }
        
        // パターンが完全に一致するかチェック
        for (const beat of pattern) {
            if (!lineKeys.includes(beat)) {
                allLinesCorrect = false;
                break;
            }
        }
        
        // このラインが不正解だったら、全体も不正解
        if (!allLinesCorrect) break;
    }
    
    if (allLinesCorrect) {
        // クリック回数条件を削除し、常にクリアできるように
        clearedStages.add(currentStage);
        currentStage++;
        updateStageContent();

        // リセットボタンの表示制御を削除
    }
    
    const currentStageBefore = currentStage;
    selectedBeats.clear();
    
    // ステージ3のselectedBeatsがクリアされたらギミックを更新
    if (currentStageBefore === 3) {
        gimmickManager.updateGimmick(currentStageBefore);
    }
    
    return;
}
//====================================================
// UI更新関数
//====================================================
const gimmickManager = new GimmickManager();

function updateProgress() {
    const progress = (currentTime / TOTAL_DURATION) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
    document.getElementById('progressKnob').style.left = `${progress}%`;
    currentTimeDisplay.textContent = formatTime(currentTime);
}

function updateStageContent() {
    titleArea.textContent = STAGE_NAMES[currentStage];
    updatePuzzleImage();
    updateBackgroundColor();
    createRhythmDots();
    
    // 選択ビートをクリア
    selectedBeats.clear();
    
    isLoopComplete = false;
    updateProblemElements();
    
    // 結果ボックスの表示を管理（ステージ7でのみ表示）
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
        // ステージ7の場合は結果ボックスを設定
        if (currentStage === 7) {
            // 結果ボックスは単純に三文字だけを表示
            resultBox.innerHTML = `<div id="stageResults">
                <div class="result-char-container">
                    <div class="result-char-box">＊</div>
                    <div class="result-char-box">＊</div>
                    <div class="result-char-box">＊</div>
                </div>
            </div>`;
            
            // シンプルなテキストのみのスタイル
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                #stageResults {
                    margin: 15px auto;
                    padding: 10px 15px;
                    text-align: center;
                    font-family: 'M PLUS Rounded 1c', sans-serif;
                    font-size: 42px;
                    font-weight: bold;
                    color: white;
                    width: fit-content;
                    min-width: 150px;
                }
            `;
            
            // 既存のスタイルがあれば削除
            const existingStyle = document.getElementById('result-box-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            styleEl.id = 'result-box-styles';
            document.head.appendChild(styleEl);
        } else {
            // ステージ7以外では結果ボックスを非表示
            resultBox.innerHTML = '';
        }
    }
    
    // リセットボタンを常に非表示に
    const resetContainer = document.getElementById('resetContainer');
    if (resetContainer) {
        resetContainer.classList.remove('show');
    }
}

function updateBackgroundColor() {
    document.body.className = `stage-${currentStage}`;
}

function updateProblemElements() {
    if (currentStage === 17) {
        // エンディング画面用の特別なレイアウト
        problemArea.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: white;
                border-radius: 10px;
                padding: 20px;
            ">
                <div style="
                    font-size: 48px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 30px;
                    font-family: 'M PLUS Rounded 1c', sans-serif;
                ">CLEAR</div>
            </div>
        `;

        // answer-area を更新
        const answerArea = document.querySelector('.answer-area');
        if (answerArea) {
            answerArea.innerHTML = `
                <p style="margin-bottom: 20px;">クリアおめでとう！</p>
                <button 
                    onclick="shareToTwitter()"
                    style="
                        padding: 12px 24px;
                        background-color: #1DA1F2;
                        color: white;
                        border: none;
                        border-radius: 20px;
                        font-size: 16px;
                        cursor: pointer;
                        font-family: 'M PLUS Rounded 1c', sans-serif;
                        margin-top: 10px;
                        z-index: 1000;
                    "
                >
                    Xで共有
                </button>
            `;
        }
    } else {
        gimmickManager.updateGimmick(currentStage, currentTime);
        gimmickManager.hideAllExcept(currentStage);
    }

    // 結果ボックスの表示を制御
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
        // ステージ7の場合のみ表示
        if (currentStage === 7) {
            resultBox.style.display = 'flex';
        } else {
            resultBox.style.display = 'none';
        }
    }
}

function update() {
    if (isPlaying) {
        currentTime = audio.currentTime;
        updateProgress();
        updateRhythmDots();
        updateProblemElements();
    }
    requestAnimationFrame(update);
}

//====================================================
// イベントリスナー
//====================================================
let isDragging = false;

function updateTimeFromClick(event, forceUpdate = false) {
    if (!isDragging && !forceUpdate) return;

    const rect = progressBarElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));

    currentTime = percentage * TOTAL_DURATION;
    audio.currentTime = currentTime;
    updateProgress();
}

playButton.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playIcon.src = 'assets/images/controls/play.png';
    } else {
        audio.play();
        playIcon.src = 'assets/images/controls/pause.png';
    }
    isPlaying = !isPlaying;
});

audio.addEventListener('ended', () => {
    currentTime = 0;
    audio.currentTime = 0;
    audio.play();
});

prevButton.addEventListener('click', () => {
    if (currentStage > 0) {
        currentStage--;
        updateStageContent();
    }
});

nextButton.addEventListener('click', () => {
    if (currentStage === 17) return;

    if (clearedStages.has(currentStage)) {
        currentStage++;
        updateStageContent();
        return;
    }

    // 新しい実装では、次へボタンは単に次のステージに進むだけ
    // ドットの選択は、a, s, d, fキーで行う
});

// プログレスバーのドラッグ制御
progressBarElement.addEventListener('mousedown', (event) => {
    const knob = document.getElementById('progressKnob');
    const knobRect = knob.getBoundingClientRect();

    if (event.clientX >= knobRect.left && event.clientX <= knobRect.right &&
        event.clientY >= knobRect.top && event.clientY <= knobRect.bottom) {
        isDragging = true;
    }
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        updateTimeFromClick(event, true);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// タッチデバイス用のイベントリスナー
function handleTouchStart(event) {
    const touch = event.touches[0];
    const knob = document.getElementById('progressKnob');
    const knobRect = knob.getBoundingClientRect();

    if (touch.clientX >= knobRect.left && touch.clientX <= knobRect.right &&
        touch.clientY >= knobRect.top && touch.clientY <= knobRect.bottom) {
        isDragging = true;
        progressBarElement.addEventListener('touchmove', handleTouchMove);
    }
}

function handleTouchMove(event) {
    if (isDragging) {
        event.preventDefault();
        updateTimeFromTouch(event);
    }
}

function handleTouchEnd() {
    isDragging = false;
    progressBarElement.removeEventListener('touchmove', handleTouchMove);
}

function updateTimeFromTouch(event) {
    if (!isDragging) return;

    const touch = event.touches[0];
    const rect = progressBarElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));

    currentTime = percentage * TOTAL_DURATION;
    audio.currentTime = currentTime;
    updateProgress();
}

progressBarElement.addEventListener('touchstart', handleTouchStart);
progressBarElement.addEventListener('touchend', handleTouchEnd);

// ウィンドウリサイズ時の処理
window.addEventListener('resize', () => {
    createRhythmDots();
    updateProblemElements();
});




//====================================================
// デバッグツール
//====================================================
const debugTools = {
    initialize() {
        const stageSelect = document.getElementById('stageSelect');
        const jumpButton = document.getElementById('debugJump');
        const toggleButton = document.getElementById('toggleDebug');
        const debugPanel = document.getElementById('debugTools');

        // デバッグツール表示切り替え
        if (toggleButton && debugPanel) {
            toggleButton.addEventListener('click', () => {
                debugPanel.classList.toggle('visible');
                toggleButton.classList.toggle('active');
            });
        }

        // ステージジャンプ
        jumpButton.addEventListener('click', () => {
            const targetStage = parseInt(stageSelect.value);
            this.forceJumpToStage(targetStage);
        });

        // リズムドット表示設定の初期化
        this.initRhythmDotsVisibilityControls();

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            let targetStage = null;
            
            // 通常の数字キー (0-9)
            if (e.key >= '0' && e.key <= '9' && !e.shiftKey && !e.ctrlKey) {
                targetStage = parseInt(e.key);
            }
            // Shift + 数字キー (11-19)
            else if (e.key >= '1' && e.key <= '9' && e.shiftKey && !e.ctrlKey) {
                targetStage = parseInt(e.key) + 10;
            }
            // Ctrl + 数字キー (21-29)
            else if (e.key >= '1' && e.key <= '9' && !e.shiftKey && e.ctrlKey) {
                targetStage = parseInt(e.key) + 20;
            }

            if (targetStage !== null && targetStage <= 25) {
                this.forceJumpToStage(targetStage);
            }
        });

        // 入力状態表示のデバッガーを追加
        this.createInputDebugger();
    },

    // リズムドット表示設定のコントロールを初期化
    initRhythmDotsVisibilityControls() {
        const controlsContainer = document.getElementById('rhythmDotsControls');
        if (!controlsContainer) return;

        // 各ステージ用のボタンを作成
        for (let stage = 0; stage <= 17; stage++) {
            const button = document.createElement('button');
            button.className = `dot-toggle-btn ${RHYTHM_DOTS_VISIBILITY[stage] ? 'active' : ''}`;
            button.textContent = stage;
            button.setAttribute('data-stage', stage);

            button.addEventListener('click', () => {
                // 表示設定を切り替え
                RHYTHM_DOTS_VISIBILITY[stage] = !RHYTHM_DOTS_VISIBILITY[stage];
                button.classList.toggle('active', RHYTHM_DOTS_VISIBILITY[stage]);
                
                // 設定を保存
                saveRhythmDotsVisibility();
                
                // 現在のステージの場合は即座に更新
                if (stage === currentStage) {
                    createRhythmDots();
                }
            });

            controlsContainer.appendChild(button);
        }

        // 全表示ボタン
        document.getElementById('showAllDots').addEventListener('click', () => {
            this.setAllRhythmDotsVisibility(true);
        });

        // 全非表示ボタン
        document.getElementById('hideAllDots').addEventListener('click', () => {
            this.setAllRhythmDotsVisibility(false);
        });

        // 現在ステージのみ切替ボタン
        document.getElementById('toggleCurrentDots').addEventListener('click', () => {
            const currentValue = RHYTHM_DOTS_VISIBILITY[currentStage];
            RHYTHM_DOTS_VISIBILITY[currentStage] = !currentValue;
            this.updateRhythmDotsButtons();
            
            // 設定を保存
            saveRhythmDotsVisibility();
            
            createRhythmDots();
        });
    },

    // 全ステージのリズムドット表示設定を一括設定
    setAllRhythmDotsVisibility(visible) {
        for (let stage = 0; stage <= 17; stage++) {
            RHYTHM_DOTS_VISIBILITY[stage] = visible;
        }
        
        // 設定を保存
        saveRhythmDotsVisibility();
        
        this.updateRhythmDotsButtons();
        createRhythmDots();
    },

    // リズムドット表示設定ボタンの表示を更新
    updateRhythmDotsButtons() {
        const buttons = document.querySelectorAll('.dot-toggle-btn');
        buttons.forEach(button => {
            const stage = parseInt(button.getAttribute('data-stage'));
            button.classList.toggle('active', RHYTHM_DOTS_VISIBILITY[stage]);
        });
    },

    // 入力状態デバッガーの作成
    createInputDebugger() {
        // 既存の要素を取得
        const existingDebugger = document.getElementById('inputDebugger');
        if (existingDebugger) {
            document.body.removeChild(existingDebugger);
        }

        // デバッガー要素を作成
        const debuggerElement = document.createElement('div');
        debuggerElement.id = 'inputDebugger';
        debuggerElement.style.cssText = `
            position: fixed;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            z-index: 9999;
            min-width: 150px;
        `;

        // 入力状態を表示するための要素
        const keyStateInfo = document.createElement('div');
        keyStateInfo.id = 'keyStateInfo';
        keyStateInfo.innerHTML = `
            <div>A: <span id="keyA">□</span></div>
            <div>S: <span id="keyS">□</span></div>
            <div>D: <span id="keyD">□</span></div>
            <div>F: <span id="keyF">□</span></div>
            <hr style="margin: 5px 0; border-color: #555;">
            <div>Beat: <span id="currentBeatDisplay">-</span></div>
            <div>Selected: <span id="selectedBeatsDisplay">-</span></div>
        `;
        debuggerElement.appendChild(keyStateInfo);

        // 閉じるボタン
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 2px;
            right: 2px;
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            padding: 0 5px;
        `;
        closeButton.onclick = () => {
            debuggerElement.style.display = 'none';
        };
        debuggerElement.appendChild(closeButton);

        // bodyに追加
        document.body.appendChild(debuggerElement);

        // キー入力のイベントリスナー
        this.setupInputDebuggerEvents();
    },

    // 入力デバッガーのイベントを設定
    setupInputDebuggerEvents() {
        // キーダウンイベント
        document.addEventListener('keydown', (e) => {
            const keyElem = this.getKeyElement(e.keyCode);
            if (keyElem) {
                keyElem.textContent = '■';
                keyElem.style.color = '#00ff00';
            }
            this.updateDebuggerInfo();
        });

        // キーアップイベント
        document.addEventListener('keyup', (e) => {
            const keyElem = this.getKeyElement(e.keyCode);
            if (keyElem) {
                keyElem.textContent = '□';
                keyElem.style.color = 'white';
            }
        });

        // 定期的に情報を更新
        setInterval(() => this.updateDebuggerInfo(), 100);
    },

    // キーコードから対応する要素を取得
    getKeyElement(keyCode) {
        switch (keyCode) {
            case 65: return document.getElementById('keyA'); // A
            case 83: return document.getElementById('keyS'); // S
            case 68: return document.getElementById('keyD'); // D
            case 70: return document.getElementById('keyF'); // F
            default: return null;
        }
    },

    // デバッガー情報を更新
    updateDebuggerInfo() {
        const beatDisplay = document.getElementById('currentBeatDisplay');
        const selectedDisplay = document.getElementById('selectedBeatsDisplay');

        if (beatDisplay) {
            beatDisplay.textContent = Math.floor(currentBeatProgress) + 1;
        }

        if (selectedDisplay) {
            const selectedKeys = Array.from(selectedBeats).join(', ');
            selectedDisplay.textContent = selectedKeys || '-';
        }
    },

    // 強制的にステージを移動する関数
    forceJumpToStage(stageNumber) {
        if (stageNumber >= 0 && stageNumber <= 25) {
            // ゲームの状態をリセット
            selectedBeats.clear();
            isLoopComplete = false;
            currentStage = stageNumber;
            
            // 前のステージをクリア済みに
            clearedStages = new Set();
            for (let i = 0; i < stageNumber; i++) {
                clearedStages.add(i);
            }

            // UI更新
            updateStageContent();
            console.log(`デバッグ: ステージ${stageNumber}に移動しました`);
        }
    }
};

// ステージ更新時にセレクトボックスも更新
const originalUpdateStageContent = updateStageContent;
updateStageContent = function() {
    originalUpdateStageContent.apply(this, arguments);
    const stageSelect = document.getElementById('stageSelect');
    if (stageSelect) {
        stageSelect.value = currentStage;
    }
};

//====================================================
// 初期化
//====================================================
// アセットのプリロード機能を追加
class AssetLoader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.loadingScreen = document.getElementById('loadingScreen');
        this.progressBar = this.loadingScreen.querySelector('.loader-progress');
        this.progressText = this.loadingScreen.querySelector('.progress-value');
        this.audio = new Audio('assets/audio/MUSIC.mp3');
    }

    updateLoadingProgress() {
        const percentage = Math.floor((this.loadedAssets / this.totalAssets) * 100);
        this.progressText.textContent = `${percentage}%`;
        this.progressBar.style.width = `${percentage}%`;
        
        // 進捗によってアニメーション効果を変える
        if (percentage > 0) {
            this.progressBar.style.boxShadow = `0 0 ${15 + percentage/5}px rgba(120, 120, 255, ${0.7 + percentage/300})`;
        }
    }

    async loadAll() {
        try {
            // 画像のリストを作成
            const imageList = [
                // パズル画像
                ...Object.values(PUZZLE_IMAGES),
                
                // コントロール画像
                'assets/images/controls/play.png',
                'assets/images/controls/pause.png',
                'assets/images/controls/prev.png',
                'assets/images/controls/next.png',
                // ヒント画像を削除
                
                // Stage 8の月の画像
                ...Array.from({ length: 8 }, (_, i) => `assets/images/puzzles/stage8/moon${i}.png`),

                // Stage 10の画像
                ...Array.from({ length: 8 }, (_, i) => `assets/images/puzzles/stage10/black${i}.png`),

                // Wall画像
                ...Array.from({ length: 16 }, (_, i) => `assets/images/puzzles/wall/wall${i}.png`)
            ];

            this.totalAssets = imageList.length + 1; // +1 for audio
            this.loadedAssets = 0;

            // 画像のプリロード
            const imagePromises = imageList.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        this.loadedAssets++;
                        this.updateLoadingProgress();
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = src;
                });
            });

            // オーディオの完全なロード
            const audioPromise = new Promise((resolve, reject) => {
                let loaded = false;
                
                // データの完全なロードを待つ
                this.audio.addEventListener('loadeddata', () => {
                    // 音声データの一部がロードされた
                    this.updateLoadingProgress();
                });

                // 再生可能になるまで待つ
                this.audio.addEventListener('canplaythrough', () => {
                    if (!loaded) {
                        loaded = true;
                        this.loadedAssets++;
                        this.updateLoadingProgress();
                        resolve(this.audio);
                    }
                });

                this.audio.addEventListener('error', reject);
                
                // 明示的にロード開始
                this.audio.load();
            });

            // すべてのアセットのロード完了を待つ
            const [loadedAudio] = await Promise.all([audioPromise, ...imagePromises]);
            
            // グローバルのaudio要素に設定
            window.audio = loadedAudio;

            // 100%表示の後に少し待機してから消す（演出効果）
            this.progressBar.style.width = '100%';
            this.progressText.textContent = '100%';
            this.progressBar.style.boxShadow = '0 0 35px rgba(120, 120, 255, 1)';

            // ローディングメッセージを変更
            const loadingMessage = document.querySelector('.loading-message');
            if (loadingMessage) {
                loadingMessage.textContent = 'Ready!';
                loadingMessage.style.color = 'rgba(255, 255, 255, 0.8)';
                loadingMessage.style.animation = 'none';
                loadingMessage.style.fontWeight = 'bold';
            }

            // ちょっと待ってから消す（演出効果）
            await new Promise(resolve => setTimeout(resolve, 800));

            // ローディング画面をフェードアウト
            this.loadingScreen.classList.add('fade-out');
            await new Promise(resolve => setTimeout(resolve, 500));
            this.loadingScreen.style.display = 'none';
            
            return true;
        } catch (error) {
            console.error('Asset loading failed:', error);
            this.progressText.textContent = 'Loading failed. Please refresh.';
            return false;
        }
    }
}

// 初期化関数を修正
async function initialize() {
    // モーダルの制御
    const modal = document.getElementById('startModal');
    const container = document.querySelector('.container');
    
    // 最初は全て非表示
    modal.style.visibility = 'hidden';
    container.style.visibility = 'hidden';

    // アセットのロード
    const loader = new AssetLoader();
    const loadSuccess = await loader.loadAll();

    if (!loadSuccess) {
        return; // ロード失敗時は初期化中止
    }

    // ロード完了後にモーダルを表示
    modal.style.visibility = 'visible';
    
    // ゲーム開始を遅延させる
    const startGame = () => {
        modal.style.display = 'none';
        container.style.visibility = 'visible';
        updateStageContent();
        updateProgress();
        requestAnimationFrame(update);
        debugTools.initialize();
    };
    
    // スペースキーイベントリスナーを追加
    document.addEventListener('keydown', function(event) {
        // スタートモーダルが表示されている時のみスペースキーを処理
        if (modal.style.visibility === 'visible' && modal.style.display !== 'none' && event.keyCode === 32) {
            event.preventDefault();
            startGame();
        }
    });
    
    // フルスクリーンボタンを追加
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'fullscreenBtn';
    fullscreenButton.className = 'fullscreen-button';
    fullscreenButton.innerText = '全画面表示';
    fullscreenButton.addEventListener('click', toggleFullScreen);
    document.querySelector('.container').appendChild(fullscreenButton);
}


document.addEventListener('keydown', (event) => {
    // エンターキー(13)またはスペースキー(32)が押された場合
    if (event.keyCode === 13 || event.keyCode === 39) { // エンターキーまたは右矢印キー
        // デフォルトの動作を防止（スペースキーでのスクロールなど）
        event.preventDefault();
        
        // 次へボタンのクリックをシミュレート
        const nextButton = document.getElementById('nextButton');
        if (nextButton) {
            nextButton.click();
            
            // クリックエフェクトを追加（オプション）
            nextButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                nextButton.style.transform = 'scale(1)';
            }, 100);
        }
    } else if (event.keyCode === 32) { // スペースキー
        event.preventDefault();
        
        // 再生/一時停止ボタンのクリックをシミュレート
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.click();
            
            // クリックエフェクトを追加
            playButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                playButton.style.transform = 'scale(1)';
            }, 100);
        }
    } else if (event.keyCode === 37) { // 左矢印キー
        event.preventDefault();
        
        // 前へボタンのクリックをシミュレート
        const prevButton = document.getElementById('prevButton');
        if (prevButton) {
            prevButton.click();
            
            // クリックエフェクトを追加
            prevButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                prevButton.style.transform = 'scale(1)';
            }, 100);
        }
    } else if (event.keyCode === 38) { // 上矢印キー - 10秒進む
        event.preventDefault();
        currentTime = Math.min(currentTime + 10, TOTAL_DURATION);
        audio.currentTime = currentTime;
        updateProgress();
    } else if (event.keyCode === 40) { // 下矢印キー - 10秒戻る
        event.preventDefault();
        currentTime = Math.max(currentTime - 10, 0);
        audio.currentTime = currentTime;
        updateProgress();
    } 
    // ドット制御のキー（a, s, d, f）
    else if (event.keyCode === 65) { // 'a'キー - 1列目のドット（ステージ5と6では赤担当）
        event.preventDefault();
        
        // ステージ5または6の場合は赤のドットを担当
        if (currentStage === 5 || currentStage === 6) {
            handleDotSelection(0); // ライン0 = 赤担当
        } else {
            handleDotSelection(0);
        }
    } else if (event.keyCode === 83) { // 's'キー - 2列目のドット（ステージ5と6では青担当）
        event.preventDefault();
        
        // ステージ5または6の場合は青のドットを担当
        if (currentStage === 5 || currentStage === 6) {
            handleDotSelection(1); // ライン1 = 青担当
        } else {
            handleDotSelection(1);
        }
    } else if (event.keyCode === 68) { // 'd'キー - 3列目のドット（ステージ5と6では緑担当）
        event.preventDefault();
        
        // ステージ5または6の場合は緑のドットを担当
        if (currentStage === 5 || currentStage === 6) {
            handleDotSelection(2); // ライン2 = 緑担当
        } else {
            handleDotSelection(2);
        }
    } else if (event.keyCode === 70) { // 'f'キー - 4列目のドット
        event.preventDefault();
        handleDotSelection(3);
    } else if (event.keyCode === 74) { // 'j'キー - 5列目のドット
        event.preventDefault();
        handleDotSelection(4);
    } else if (event.keyCode === 75) { // 'k'キー - 6列目のドット
        event.preventDefault();
        handleDotSelection(5);
    } else if (event.keyCode === 76) { // 'l'キー - 7列目のドット
        event.preventDefault();
        handleDotSelection(6);
    } else if (event.keyCode === 186) { // ';'キー - 8列目のドット
        event.preventDefault();
        handleDotSelection(7);
    }
});

// ドット選択処理関数
function handleDotSelection(lineIndex) {
    // リズムドットが表示されていなくても、機能は通常通り動作させる
    // 以下のコードは以前あった非表示時にreturnする処理を削除

    // 現在のステージで利用可能なライン数をチェック
    let availableLines = 1;
    if (currentStage >= 13 && currentStage <= 16) {
        availableLines = 8; // 13-16ステージは8ライン
    } else if (currentStage >= 9) {
        availableLines = 4;
    } else if (currentStage >= 5) {
        availableLines = 3;
    }
    
    // 利用可能なライン数を超えている場合は何もしない
    if (lineIndex >= availableLines) return;
    
    // 現在のビート位置を取得 (1～8の範囲に修正)
    const currentBeat = Math.floor(currentBeatProgress) + 1;
    
    // ラインとビート番号の組み合わせをキーとして使用
    // beatKeyは「ライン番号-ビート番号」形式で、ビート番号は1～8の範囲
    const beatKey = `${lineIndex}-${currentBeat}`;
    
    console.log(`ライン ${lineIndex} のビート ${currentBeat} を選択`);
    
    // 選択状態を追加
    selectedBeats.add(beatKey);
    
    // ステージ3でリズムドットが選択された場合、ギミックを更新
    if (currentStage === 3) {
        gimmickManager.updateGimmick(currentStage);
    }
    
    // ステージ7のパターン認識と結果表示
    if (currentStage === 7) {
        updateStage7Results();
    }
}

// ステージ7の結果解析と表示の関数
function updateStage7Results() {
    // パターンとアルファベットのマッピング定義（1～8の拍のパターン）
    const patternMap = [
        { dots: [1, 4], letter: 'T' },
        { dots: [2, 3, 5], letter: 'A' },
        { dots: [2, 3, 6], letter: 'O' },
        { dots: [2], letter: 'I' },
        { dots: [4], letter: 'I' },
        { dots: [8], letter: 'I' },
        { dots: [7, 8], letter: 'U' },
        { dots: [2, 6], letter: 'L' },
        { dots: [7], letter: 'L' }
    ];
    
    // 各ラインの結果を保存
    const resultLetters = [];
    const lineSelectedDots = [[], [], []]; // 各ラインの選択ドットを保存
    
    // selectedBeatsからラインごとの選択状態を取得
    Array.from(selectedBeats).forEach(beatKey => {
        const parts = beatKey.split('-');
        if (parts.length === 2) {
            const lineIndex = parseInt(parts[0]);
            const beatNumber = parseInt(parts[1]);
            
            // 有効なライン（0-2）のみを処理
            if (lineIndex >= 0 && lineIndex <= 2) {
                lineSelectedDots[lineIndex].push(beatNumber);
            }
        }
    });
    
    // デバッグ情報
    console.log("現在のselectedBeats:", Array.from(selectedBeats));
    console.log("ライン別選択ドット:", lineSelectedDots);
    
    // 各ラインについてパターンマッチング
    for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
        const selectedDots = lineSelectedDots[lineIndex];
        
        // 選択がなければスキップ
        if (selectedDots.length === 0) continue;
        
        // 選択ドットを昇順にソート
        const sortedDots = [...selectedDots].sort((a, b) => a - b);
        console.log(`ライン ${lineIndex} のソート済み選択ドット:`, sortedDots);
        
        // パターンマッチング - 完全一致のみ
        for (const pattern of patternMap) {
            // パターンもソートして比較
            const sortedPattern = [...pattern.dots].sort((a, b) => a - b);
            
            console.log(`パターンチェック: ${sortedDots} vs ${sortedPattern}`);
            
            // 完全一致の場合のみ結果に追加
            if (sortedDots.length === sortedPattern.length &&
                sortedDots.every((val, idx) => val === sortedPattern[idx])) {
                
                console.log(`ライン ${lineIndex} で完全一致: ${pattern.letter} (${pattern.dots})`);
                resultLetters.push({
                    line: lineIndex,
                    letter: pattern.letter,
                    dots: sortedDots.join(',')
                });
                break;
            }
        }
    }
    
    // 結果ボックスを更新
    updateResultBoxWithAlphabets(resultLetters);
}

// 結果ボックスの更新
function updateResultBoxWithAlphabets(resultLetters) {
    const resultBox = document.getElementById('stageResults');
    if (!resultBox) return;
    
    // 検出された文字を取得（各ラインごとに）
    const lettersByLine = Array(3).fill('＊');
    
    // 各ラインの文字を設定
    resultLetters.forEach(result => {
        if (result.line >= 0 && result.line < 3) {
            lettersByLine[result.line] = result.letter;
        }
    });
    
    // 文字を表示（透明な枠で囲んで連結する）
    resultBox.innerHTML = `
        <div class="result-char-container">
            <div class="result-char-box">${lettersByLine[0]}</div>
            <div class="result-char-box">${lettersByLine[1]}</div>
            <div class="result-char-box">${lettersByLine[2]}</div>
        </div>
    `;
}

// 初期化実行
initialize();

// フルスクリーン切り替え関数
function toggleFullScreen() {
    if (!document.fullscreenElement &&    // standard property
        !document.mozFullScreenElement && // Firefox
        !document.webkitFullscreenElement && // Chrome, Safari and Opera
        !document.msFullscreenElement) {  // IE/Edge
        
        // フルスクリーンに入る
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) { /* Firefox */
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            docElm.webkitRequestFullscreen();
        } else if (docElm.msRequestFullscreen) { /* IE/Edge */
            docElm.msRequestFullscreen();
        }
        
        document.getElementById('fullscreenBtn').innerText = '全画面解除';
    } else {
        // フルスクリーンを解除
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
        
        document.getElementById('fullscreenBtn').innerText = '全画面表示';
    }
}

// フルスクリーンの状態変化を監視
document.addEventListener('fullscreenchange', updateFullscreenButtonText);
document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
document.addEventListener('MSFullscreenChange', updateFullscreenButtonText);

function updateFullscreenButtonText() {
    const button = document.getElementById('fullscreenBtn');
    if (button) {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
            button.innerText = '全画面解除';
        } else {
            button.innerText = '全画面表示';
        }
    }
    
    // フルスクリーン切り替え時にリサイズイベントを発火させて、
    // 問題エリアの要素が正しくリサイズされるようにする
    window.dispatchEvent(new Event('resize'));
}