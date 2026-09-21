/**
 * ============================================================
 *  SZ.sounds - 刷题应用音效系统
 * ============================================================
 *
 *  基于 Web Audio API 的纯代码音效生成系统
 *  无需外部音频文件，所有音效均由代码实时合成
 *
 *  功能特性：
 *  - 50+ 种精心设计的音效
 *  - 分类型音量控制（主音量、音效音量、环境音音量）
 *  - 音效风格切换（答对/答错音效可选择不同风格）
 *  - 3D 空间音效支持
 *  - 音频可视化（频谱分析）
 *  - 淡入淡出效果
 *  - 循环播放控制
 *  - 节点池复用，性能优化
 *
 *  使用方式：
 *  - SZ.sounds.play('correct_1')
 *  - SZ.sounds.setVolume('master', 0.5)
 *  - SZ.sounds.toggleMute()
 *
 * ============================================================
 */

(function(global) {
  'use strict';

  // ============================================================
  //  命名空间初始化
  // ============================================================

  global.SZ = global.SZ || {};

  // ============================================================
  //  常量定义
  // ============================================================

  const SOUND_TYPES = {
    CORRECT: 'correct',
    WRONG: 'wrong',
    UI: 'ui',
    GAME: 'game',
    AMBIENT: 'ambient'
  };

  // ============================================================
  //  答对音效生成器
  // ============================================================

  const CorrectSounds = {

    /**
     * correct_1: 上升琶音（C大调和弦琶音）
     * 清脆悦耳的钢琴式琶音
     */
    correct_1(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'correct_1', {
        ...options,
        type: SOUND_TYPES.CORRECT,
        duration: 0.6
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // C大调和弦：C4, E4, G4, C5, E5, G5
      const notes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'];
      const noteDelay = 0.08;
      const noteDuration = 0.35;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = now + i * noteDelay;
        const env = new Envelope({
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.2,
          peak: 0.3 - i * 0.02
        });
        env.applyTo(noteGain.gain, startTime, noteDuration);

        osc.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + noteDuration + 0.2);

        instance.addNode(osc);
        instance.addNode(noteGain);
      }

      // 添加高频谐波增加清脆感
      for (let i = 0; i < 3; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const notes2 = ['C5', 'E5', 'G5'];
        const freq = noteToFreq(notes2[i]) * 2;

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + 0.15 + i * noteDelay;
        const env = new Envelope({
          attack: 0.01,
          decay: 0.15,
          sustain: 0,
          release: 0.15,
          peak: 0.1
        });
        env.applyTo(noteGain.gain, startTime, 0.2);

        osc.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + 0.35);

        instance.addNode(osc);
        instance.addNode(noteGain);
      }

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * correct_2: 叮咚声（类似门铃）
     * 经典的两声门铃音效
     */
    correct_2(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'correct_2', {
        ...options,
        type: SOUND_TYPES.CORRECT,
        duration: 0.8
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 第一声：高音
      const osc1 = manager.pool.getOscillator();
      const gain1 = manager.pool.getGain();
      osc1.type = 'sine';
      osc1.frequency.value = noteToFreq('E6');
      osc1.start(now);
      osc1.stop(now + 0.5);

      const env1 = new Envelope({
        attack: 0.003,
        decay: 0.3,
        sustain: 0.1,
        release: 0.2,
        peak: 0.4
      });
      env1.applyTo(gain1.gain, now, 0.3);

      // 添加泛音
      const osc1h = manager.pool.getOscillator();
      const gain1h = manager.pool.getGain();
      osc1h.type = 'sine';
      osc1h.frequency.value = noteToFreq('E6') * 2;
      osc1h.start(now);
      osc1h.stop(now + 0.3);

      const env1h = new Envelope({
        attack: 0.002,
        decay: 0.2,
        sustain: 0,
        release: 0.1,
        peak: 0.15
      });
      env1h.applyTo(gain1h.gain, now, 0.2);

      // 第二声：低音（延迟）
      const delayTime = 0.18;
      const osc2 = manager.pool.getOscillator();
      const gain2 = manager.pool.getGain();
      osc2.type = 'sine';
      osc2.frequency.value = noteToFreq('C#6');
      osc2.start(now + delayTime);
      osc2.stop(now + delayTime + 0.6);

      const env2 = new Envelope({
        attack: 0.003,
        decay: 0.35,
        sustain: 0.15,
        release: 0.25,
        peak: 0.4
      });
      env2.applyTo(gain2.gain, now + delayTime, 0.35);

      // 第二声泛音
      const osc2h = manager.pool.getOscillator();
      const gain2h = manager.pool.getGain();
      osc2h.type = 'sine';
      osc2h.frequency.value = noteToFreq('C#6') * 2;
      osc2h.start(now + delayTime);
      osc2h.stop(now + delayTime + 0.35);

      const env2h = new Envelope({
        attack: 0.002,
        decay: 0.2,
        sustain: 0,
        release: 0.15,
        peak: 0.12
      });
      env2h.applyTo(gain2h.gain, now + delayTime, 0.2);

      // 连接
      osc1.connect(gain1);
      gain1.connect(mainGain);
      osc1h.connect(gain1h);
      gain1h.connect(mainGain);
      osc2.connect(gain2);
      gain2.connect(mainGain);
      osc2h.connect(gain2h);
      gain2h.connect(mainGain);

      instance.addNode(osc1);
      instance.addNode(gain1);
      instance.addNode(osc1h);
      instance.addNode(gain1h);
      instance.addNode(osc2);
      instance.addNode(gain2);
      instance.addNode(osc2h);
      instance.addNode(gain2h);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * correct_3: 胜利小号声
     * 激昂的小号式胜利音效
     */
    correct_3(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'correct_3', {
        ...options,
        type: SOUND_TYPES.CORRECT,
        duration: 0.9
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 胜利号角旋律：G4-C5-E5-G5 (上行)
      const notes = ['G4', 'C5', 'E5', 'G5'];
      const noteDelay = 0.12;

      for (let i = 0; i < notes.length; i++) {
        // 主音（方波模拟铜管）
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'square';
        osc.frequency.value = freq;

        const startTime = now + i * noteDelay;
        const noteDur = 0.25;

        // 使用低通滤波软化方波
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = freq * 6;
        filter.Q.value = 1;

        const env = new Envelope({
          attack: 0.02,
          decay: 0.1,
          sustain: 0.5,
          release: 0.15,
          peak: 0.2
        });
        env.applyTo(noteGain.gain, startTime, noteDur);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + noteDur + 0.15);

        instance.addNode(osc);
        instance.addNode(noteGain);
        instance.addNode(filter);
      }

      // 最后长音
      const finalOsc = manager.pool.getOscillator();
      const finalGain = manager.pool.getGain();
      const finalFreq = noteToFreq('G5');
      finalOsc.type = 'square';
      finalOsc.frequency.value = finalFreq;

      const finalFilter = ctx.createBiquadFilter();
      finalFilter.type = 'lowpass';
      finalFilter.frequency.value = finalFreq * 5;

      const finalStartTime = now + 4 * noteDelay;
      const finalEnv = new Envelope({
        attack: 0.03,
        decay: 0.15,
        sustain: 0.6,
        release: 0.3,
        peak: 0.25
      });
      finalEnv.applyTo(finalGain.gain, finalStartTime, 0.4);

      finalOsc.connect(finalFilter);
      finalFilter.connect(finalGain);
      finalGain.connect(mainGain);

      finalOsc.start(finalStartTime);
      finalOsc.stop(finalStartTime + 0.7);

      instance.addNode(finalOsc);
      instance.addNode(finalGain);
      instance.addNode(finalFilter);

      // 添加轻微的颤音效果
      const lfo = manager.pool.getOscillator();
      const lfoGain = manager.pool.getGain();
      lfo.type = 'sine';
      lfo.frequency.value = 6; // 6Hz 颤音
      lfoGain.gain.value = 8; // 频率偏移量

      lfo.connect(lfoGain);
      lfoGain.connect(finalOsc.frequency);
      lfo.start(finalStartTime);
      lfo.stop(finalStartTime + 0.7);

      instance.addNode(lfo);
      instance.addNode(lfoGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * correct_4: 魔法音效（星星闪烁）
     * 梦幻般的闪亮音效
     */
    correct_4(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'correct_4', {
        ...options,
        type: SOUND_TYPES.CORRECT,
        duration: 0.7
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 多个随机高频闪亮声
      const numSparks = 12;
      for (let i = 0; i < numSparks; i++) {
        const osc = manager.pool.getOscillator();
        const sparkGain = manager.pool.getGain();

        // 随机高音
        const baseFreq = random(1500, 3500);
        osc.type = 'sine';
        osc.frequency.value = baseFreq;

        const startTime = now + random(0, 0.4);
        const dur = random(0.1, 0.3);

        // 频率上滑
        osc.frequency.setValueAtTime(baseFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, startTime + dur);

        const env = new Envelope({
          attack: 0.005,
          decay: dur * 0.6,
          sustain: 0.2,
          release: dur * 0.4,
          peak: random(0.08, 0.18)
        });
        env.applyTo(sparkGain.gain, startTime, dur);

        osc.connect(sparkGain);
        sparkGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);

        instance.addNode(osc);
        instance.addNode(sparkGain);
      }

      // 底层和弦铺垫
      const chordOsc1 = manager.pool.getOscillator();
      const chordOsc2 = manager.pool.getOscillator();
      const chordOsc3 = manager.pool.getOscillator();
      const chordGain = manager.pool.getGain();

      chordOsc1.type = 'sine';
      chordOsc1.frequency.value = noteToFreq('C5');
      chordOsc2.type = 'sine';
      chordOsc2.frequency.value = noteToFreq('E5');
      chordOsc3.type = 'sine';
      chordOsc3.frequency.value = noteToFreq('G5');

      const chordEnv = new Envelope({
        attack: 0.1,
        decay: 0.2,
        sustain: 0.3,
        release: 0.3,
        peak: 0.08
      });
      chordEnv.applyTo(chordGain.gain, now + 0.05, 0.4);

      chordOsc1.connect(chordGain);
      chordOsc2.connect(chordGain);
      chordOsc3.connect(chordGain);
      chordGain.connect(mainGain);

      chordOsc1.start(now + 0.05);
      chordOsc2.start(now + 0.05);
      chordOsc3.start(now + 0.05);
      chordOsc1.stop(now + 0.8);
      chordOsc2.stop(now + 0.8);
      chordOsc3.stop(now + 0.8);

      instance.addNode(chordOsc1);
      instance.addNode(chordOsc2);
      instance.addNode(chordOsc3);
      instance.addNode(chordGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * correct_5: 柔和钢琴和弦
     * 温暖的钢琴和弦音效
     */
    correct_5(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'correct_5', {
        ...options,
        type: SOUND_TYPES.CORRECT,
        duration: 1.2
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // C大七和弦：C4, E4, G4, B4
      const chordNotes = ['C4', 'E4', 'G4', 'B4'];

      for (let i = 0; i < chordNotes.length; i++) {
        const freq = noteToFreq(chordNotes[i]);

        // 基频（三角波模拟钢琴音色）
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        // 二次谐波
        const osc2 = manager.pool.getOscillator();
        const gain2 = manager.pool.getGain();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;

        // 三次谐波
        const osc3 = manager.pool.getOscillator();
        const gain3 = manager.pool.getGain();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 3;

        const startTime = now + i * 0.015; // 略微错开增加真实感
        const dur = 1.0;

        const env = new Envelope({
          attack: 0.01,
          decay: 0.3,
          sustain: 0.2,
          release: 0.7,
          peak: 0.2
        });
        env.applyTo(noteGain.gain, startTime, dur);

        const env2 = new Envelope({
          attack: 0.008,
          decay: 0.2,
          sustain: 0.1,
          release: 0.5,
          peak: 0.08
        });
        env2.applyTo(gain2.gain, startTime, dur * 0.8);

        const env3 = new Envelope({
          attack: 0.005,
          decay: 0.15,
          sustain: 0.05,
          release: 0.3,
          peak: 0.04
        });
        env3.applyTo(gain3.gain, startTime, dur * 0.6);

        osc.connect(noteGain);
        noteGain.connect(mainGain);
        osc2.connect(gain2);
        gain2.connect(mainGain);
        osc3.connect(gain3);
        gain3.connect(mainGain);

        osc.start(startTime);
        osc2.start(startTime);
        osc3.start(startTime);
        osc.stop(startTime + dur + 0.7);
        osc2.stop(startTime + dur * 0.8 + 0.5);
        osc3.stop(startTime + dur * 0.6 + 0.3);

        instance.addNode(osc);
        instance.addNode(noteGain);
        instance.addNode(osc2);
        instance.addNode(gain2);
        instance.addNode(osc3);
        instance.addNode(gain3);
      }

      // 添加钟声般的高音
      const bellOsc = manager.pool.getOscillator();
      const bellGain = manager.pool.getGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.value = noteToFreq('C6');

      const bellEnv = new Envelope({
        attack: 0.005,
        decay: 0.5,
        sustain: 0.1,
        release: 0.8,
        peak: 0.1
      });
      bellEnv.applyTo(bellGain.gain, now + 0.05, 0.5);

      bellOsc.connect(bellGain);
      bellGain.connect(mainGain);
      bellOsc.start(now + 0.05);
      bellOsc.stop(now + 1.4);

      instance.addNode(bellOsc);
      instance.addNode(bellGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * correct_6: 欢快跳跃音效
     * 弹跳式的欢乐音效
     */
    correct_6(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'correct_6', {
        ...options,
        type: SOUND_TYPES.CORRECT,
        duration: 0.5
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 跳跃式音符：C5-E5-G5-C6-E6
      const notes = ['C5', 'E5', 'G5', 'C6', 'E6'];
      const noteDelay = 0.06;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + i * noteDelay;
        const dur = 0.15;

        // 频率弹跳效果
        osc.frequency.setValueAtTime(freq * 0.8, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.03);

        const env = new Envelope({
          attack: 0.005,
          decay: 0.08,
          sustain: 0.4,
          release: 0.08,
          peak: 0.25
        });
        env.applyTo(noteGain.gain, startTime, dur);

        osc.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.1);

        instance.addNode(osc);
        instance.addNode(noteGain);
      }

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * correct_7: 木琴琶音
     * 明亮的木琴音色
     */
    correct_7(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'correct_7', {
        ...options,
        type: SOUND_TYPES.CORRECT,
        duration: 0.55
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 上行琶音：C5, D5, E5, G5, A5, C6
      const notes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
      const noteDelay = 0.07;

      for (let i = 0; i < notes.length; i++) {
        const freq = noteToFreq(notes[i]);

        // 主音
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        // 泛音（增加木琴质感）
        const osc2 = manager.pool.getOscillator();
        const gain2 = manager.pool.getGain();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 3;

        const startTime = now + i * noteDelay;
        const dur = 0.25;

        const env = new Envelope({
          attack: 0.002,
          decay: 0.15,
          sustain: 0.2,
          release: 0.1,
          peak: 0.22
        });
        env.applyTo(noteGain.gain, startTime, dur);

        const env2 = new Envelope({
          attack: 0.001,
          decay: 0.08,
          sustain: 0.1,
          release: 0.08,
          peak: 0.06
        });
        env2.applyTo(gain2.gain, startTime, dur * 0.6);

        osc.connect(noteGain);
        noteGain.connect(mainGain);
        osc2.connect(gain2);
        gain2.connect(mainGain);

        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + dur + 0.1);
        osc2.stop(startTime + dur * 0.6 + 0.08);

        instance.addNode(osc);
        instance.addNode(noteGain);
        instance.addNode(osc2);
        instance.addNode(gain2);
      }

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    }
  };

  // ============================================================
  //  环境音效生成器
  // ============================================================


  // ============================================================
  //  答错音效生成器
  // ============================================================

  const WrongSounds = {

    /**
     * wrong_1: 下降音阶
     * 低沉的下行音阶
     */
    wrong_1(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'wrong_1', {
        ...options,
        type: SOUND_TYPES.WRONG,
        duration: 0.8
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 下行小调音阶：A4, G4, F4, E4, D4, C4
      const notes = ['A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
      const noteDelay = 0.1;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        // 低通滤波
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = freq * 3;

        const startTime = now + i * noteDelay;
        const dur = 0.25;

        const env = new Envelope({
          attack: 0.01,
          decay: 0.1,
          sustain: 0.5,
          release: 0.1,
          peak: 0.2
        });
        env.applyTo(noteGain.gain, startTime, dur);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.1);

        instance.addNode(osc);
        instance.addNode(noteGain);
        instance.addNode(filter);
      }

      // 最后的低音
      const finalOsc = manager.pool.getOscillator();
      const finalGain = manager.pool.getGain();
      finalOsc.type = 'sawtooth';
      finalOsc.frequency.value = noteToFreq('C3');

      const finalFilter = ctx.createBiquadFilter();
      finalFilter.type = 'lowpass';
      finalFilter.frequency.value = noteToFreq('C3') * 2.5;

      const finalStartTime = now + 6 * noteDelay;
      const finalEnv = new Envelope({
        attack: 0.02,
        decay: 0.2,
        sustain: 0.4,
        release: 0.3,
        peak: 0.25
      });
      finalEnv.applyTo(finalGain.gain, finalStartTime, 0.3);

      finalOsc.connect(finalFilter);
      finalFilter.connect(finalGain);
      finalGain.connect(mainGain);

      finalOsc.start(finalStartTime);
      finalOsc.stop(finalStartTime + 0.6);

      instance.addNode(finalOsc);
      instance.addNode(finalGain);
      instance.addNode(finalFilter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * wrong_2: 嗡嗡错误声（buzzer）
     * 典型的游戏错误蜂鸣声
     */
    wrong_2(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'wrong_2', {
        ...options,
        type: SOUND_TYPES.WRONG,
        duration: 0.5
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 低频蜂鸣
      const osc = manager.pool.getOscillator();
      const buzzerGain = manager.pool.getGain();
      osc.type = 'square';
      osc.frequency.value = 180;

      // 频率颤振
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(200, now + 0.05);
      osc.frequency.setValueAtTime(170, now + 0.1);
      osc.frequency.setValueAtTime(190, now + 0.15);
      osc.frequency.setValueAtTime(160, now + 0.2);
      osc.frequency.setValueAtTime(180, now + 0.25);
      osc.frequency.setValueAtTime(150, now + 0.3);
      osc.frequency.setValueAtTime(170, now + 0.35);

      const env = new Envelope({
        attack: 0.005,
        decay: 0.1,
        sustain: 0.7,
        release: 0.1,
        peak: 0.3
      });
      env.applyTo(buzzerGain.gain, now, 0.4);

      // 低通滤波柔化
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      osc.connect(filter);
      filter.connect(buzzerGain);
      buzzerGain.connect(mainGain);

      osc.start(now);
      osc.stop(now + 0.5);

      instance.addNode(osc);
      instance.addNode(buzzerGain);
      instance.addNode(filter);

      // 添加噪声质感
      const noise = manager._getNoise('white');
      const noiseSource = noise.createSource();
      const noiseGain = manager.pool.getGain();
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 400;
      noiseFilter.Q.value = 2;

      const noiseEnv = new Envelope({
        attack: 0.005,
        decay: 0.15,
        sustain: 0.3,
        release: 0.1,
        peak: 0.08
      });
      noiseEnv.applyTo(noiseGain.gain, now, 0.4);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(mainGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.5);

      instance.addNode(noiseSource);
      instance.addNode(noiseGain);
      instance.addNode(noiseFilter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * wrong_3: 玻璃破碎声
     * 模拟玻璃碎裂的音效
     */
    wrong_3(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'wrong_3', {
        ...options,
        type: SOUND_TYPES.WRONG,
        duration: 0.7
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 初始撞击声
      const impactOsc = manager.pool.getOscillator();
      const impactGain = manager.pool.getGain();
      impactOsc.type = 'sine';
      impactOsc.frequency.value = 800;
      impactOsc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

      const impactEnv = new Envelope({
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.02,
        peak: 0.3
      });
      impactEnv.applyTo(impactGain.gain, now, 0.08);

      impactOsc.connect(impactGain);
      impactGain.connect(mainGain);
      impactOsc.start(now);
      impactOsc.stop(now + 0.1);

      instance.addNode(impactOsc);
      instance.addNode(impactGain);

      // 碎片声 - 多个高频瞬态
      const numShards = 20;
      for (let i = 0; i < numShards; i++) {
        const osc = manager.pool.getOscillator();
        const shardGain = manager.pool.getGain();

        const baseFreq = random(1000, 5000);
        osc.type = 'sine';
        osc.frequency.value = baseFreq;

        const startTime = now + random(0.02, 0.3);
        const dur = random(0.05, 0.2);

        // 频率下降模拟碎片落地
        osc.frequency.setValueAtTime(baseFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, startTime + dur);

        const env = new Envelope({
          attack: 0.001,
          decay: dur * 0.6,
          sustain: 0.2,
          release: dur * 0.4,
          peak: random(0.05, 0.15)
        });
        env.applyTo(shardGain.gain, startTime, dur);

        osc.connect(shardGain);
        shardGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.02);

        instance.addNode(osc);
        instance.addNode(shardGain);
      }

      // 哗啦声 - 白噪声带通
      const noise = manager._getNoise('white');
      const noiseSource = noise.createSource();
      const noiseGain = manager.pool.getGain();
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;
      noiseFilter.Q.value = 0.5;

      const noiseEnv = new Envelope({
        attack: 0.01,
        decay: 0.15,
        sustain: 0.2,
        release: 0.25,
        peak: 0.1
      });
      noiseEnv.applyTo(noiseGain.gain, now + 0.02, 0.3);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(mainGain);

      noiseSource.start(now + 0.02);
      noiseSource.stop(now + 0.7);

      instance.addNode(noiseSource);
      instance.addNode(noiseGain);
      instance.addNode(noiseFilter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * wrong_4: 失落音效
     * 哀伤的失落感音效
     */
    wrong_4(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'wrong_4', {
        ...options,
        type: SOUND_TYPES.WRONG,
        duration: 1.0
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 下行小三和弦
      const notes = ['A4', 'C5', 'E5', 'C5', 'A4'];
      const noteDelay = 0.15;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + i * noteDelay;
        const dur = 0.4;

        // 轻微的音高下滑
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.linearRampToValueAtTime(freq * 0.98, startTime + dur);

        const env = new Envelope({
          attack: 0.05,
          decay: 0.2,
          sustain: 0.5,
          release: 0.2,
          peak: 0.2
        });
        env.applyTo(noteGain.gain, startTime, dur);

        osc.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.2);

        instance.addNode(osc);
        instance.addNode(noteGain);
      }

      // 低音铺垫
      const bassOsc = manager.pool.getOscillator();
      const bassGain = manager.pool.getGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.value = noteToFreq('A3');

      const bassEnv = new Envelope({
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 0.4,
        peak: 0.12
      });
      bassEnv.applyTo(bassGain.gain, now, 0.7);

      bassOsc.connect(bassGain);
      bassGain.connect(mainGain);
      bassOsc.start(now);
      bassOsc.stop(now + 1.1);

      instance.addNode(bassOsc);
      instance.addNode(bassGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * wrong_5: 弹簧反弹失败声
     * 弹簧压缩反弹的失败音效
     */
    wrong_5(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'wrong_5', {
        ...options,
        type: SOUND_TYPES.WRONG,
        duration: 0.6
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 弹簧压缩（频率上升）
      const osc = manager.pool.getOscillator();
      const springGain = manager.pool.getGain();
      osc.type = 'square';
      osc.frequency.value = 200;

      // 压缩阶段
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);

      // 反弹阶段（频率快速下降）
      osc.frequency.setValueAtTime(400, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

      // 反弹颤音效果
      const lfo = manager.pool.getOscillator();
      const lfoGain = manager.pool.getGain();
      lfo.type = 'sine';
      lfo.frequency.value = 20;
      lfoGain.gain.value = 20;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const env = new Envelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.6,
        release: 0.25,
        peak: 0.25
      });
      env.applyTo(springGain.gain, now, 0.4);

      // 滤波
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(springGain);
      springGain.connect(mainGain);

      osc.start(now);
      lfo.start(now + 0.15);
      lfo.stop(now + 0.5);
      osc.stop(now + 0.55);

      instance.addNode(osc);
      instance.addNode(springGain);
      instance.addNode(filter);
      instance.addNode(lfo);
      instance.addNode(lfoGain);

      // 撞击声
      const impactOsc = manager.pool.getOscillator();
      const impactGain = manager.pool.getGain();
      impactOsc.type = 'sine';
      impactOsc.frequency.value = 150;

      const impactEnv = new Envelope({
        attack: 0.002,
        decay: 0.08,
        sustain: 0,
        release: 0.05,
        peak: 0.3
      });
      impactEnv.applyTo(impactGain.gain, now + 0.15, 0.08);

      impactOsc.connect(impactGain);
      impactGain.connect(mainGain);
      impactOsc.start(now + 0.15);
      impactOsc.stop(now + 0.25);

      instance.addNode(impactOsc);
      instance.addNode(impactGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * wrong_6: 电子错误声
     * 科幻风格的错误提示
     */
    wrong_6(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'wrong_6', {
        ...options,
        type: SOUND_TYPES.WRONG,
        duration: 0.45
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 双音错误提示
      const freq1 = 440;
      const freq2 = 330;

      const osc = manager.pool.getOscillator();
      const errGain = manager.pool.getGain();
      osc.type = 'sawtooth';

      // 在两个频率间切换
      osc.frequency.setValueAtTime(freq1, now);
      osc.frequency.setValueAtTime(freq2, now + 0.1);
      osc.frequency.setValueAtTime(freq1, now + 0.2);
      osc.frequency.setValueAtTime(freq2, now + 0.3);

      const env = new Envelope({
        attack: 0.005,
        decay: 0.05,
        sustain: 0.7,
        release: 0.08,
        peak: 0.2
      });
      env.applyTo(errGain.gain, now, 0.35);

      // 高通滤波
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 200;

      osc.connect(filter);
      filter.connect(errGain);
      errGain.connect(mainGain);

      osc.start(now);
      osc.stop(now + 0.45);

      instance.addNode(osc);
      instance.addNode(errGain);
      instance.addNode(filter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * wrong_7: 低音失败鼓声
     * 沉重的失败鼓点
     */
    wrong_7(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'wrong_7', {
        ...options,
        type: SOUND_TYPES.WRONG,
        duration: 0.6
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 低音鼓
      const kickOsc = manager.pool.getOscillator();
      const kickGain = manager.pool.getGain();
      kickOsc.type = 'sine';

      // 频率从高到低（鼓的特征）
      kickOsc.frequency.setValueAtTime(120, now);
      kickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      const kickEnv = new Envelope({
        attack: 0.001,
        decay: 0.2,
        sustain: 0.1,
        release: 0.2,
        peak: 0.5
      });
      kickEnv.applyTo(kickGain.gain, now, 0.15);

      kickOsc.connect(kickGain);
      kickGain.connect(mainGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.4);

      instance.addNode(kickOsc);
      instance.addNode(kickGain);

      // 第二声（延迟）
      const kickOsc2 = manager.pool.getOscillator();
      const kickGain2 = manager.pool.getGain();
      kickOsc2.type = 'sine';

      const delay2 = 0.2;
      kickOsc2.frequency.setValueAtTime(100, now + delay2);
      kickOsc2.frequency.exponentialRampToValueAtTime(35, now + delay2 + 0.2);

      const kickEnv2 = new Envelope({
        attack: 0.001,
        decay: 0.25,
        sustain: 0.1,
        release: 0.25,
        peak: 0.4
      });
      kickEnv2.applyTo(kickGain2.gain, now + delay2, 0.2);

      kickOsc2.connect(kickGain2);
      kickGain2.connect(mainGain);
      kickOsc2.start(now + delay2);
      kickOsc2.stop(now + delay2 + 0.5);

      instance.addNode(kickOsc2);
      instance.addNode(kickGain2);

      // 噪声质感
      const noise = manager._getNoise('white');
      const noiseSource = noise.createSource();
      const noiseGain = manager.pool.getGain();
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 200;

      const noiseEnv = new Envelope({
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.05,
        peak: 0.1
      });
      noiseEnv.applyTo(noiseGain.gain, now, 0.1);
      noiseEnv.applyTo(noiseGain.gain, now + delay2, 0.1);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(mainGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.5);

      instance.addNode(noiseSource);
      instance.addNode(noiseGain);
      instance.addNode(noiseFilter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    }
  };



  // ============================================================
  //  界面交互音效生成器
  // ============================================================

  const UISounds = {

    /**
     * click: 点击按钮声
     * 简洁的按钮点击音效
     */
    click(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'click', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.08
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 高频点击声
      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.02);

      const env = new Envelope({
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.02,
        peak: 0.25
      });
      env.applyTo(mainGain.gain, now, 0.06);

      osc.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.08);

      instance.addNode(osc);

      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * hover: 悬停声
     * 轻柔的悬停提示音
     */
    hover(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'hover', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.06
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1500;

      const env = new Envelope({
        attack: 0.003,
        decay: 0.03,
        sustain: 0,
        release: 0.02,
        peak: 0.1
      });
      env.applyTo(mainGain.gain, now, 0.04);

      osc.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.06);

      instance.addNode(osc);

      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * select: 选中选项声
     * 选择确认音效
     */
    select(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'select', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.15
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 双音选择声
      const osc1 = manager.pool.getOscillator();
      const gain1 = manager.pool.getGain();
      osc1.type = 'sine';
      osc1.frequency.value = noteToFreq('C6');

      const env1 = new Envelope({
        attack: 0.002,
        decay: 0.08,
        sustain: 0.3,
        release: 0.05,
        peak: 0.2
      });
      env1.applyTo(gain1.gain, now, 0.1);

      const osc2 = manager.pool.getOscillator();
      const gain2 = manager.pool.getGain();
      osc2.type = 'sine';
      osc2.frequency.value = noteToFreq('E6');

      const env2 = new Envelope({
        attack: 0.002,
        decay: 0.08,
        sustain: 0.3,
        release: 0.05,
        peak: 0.18
      });
      env2.applyTo(gain2.gain, now + 0.04, 0.1);

      osc1.connect(gain1);
      gain1.connect(mainGain);
      osc2.connect(gain2);
      gain2.connect(mainGain);

      osc1.start(now);
      osc2.start(now + 0.04);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);

      instance.addNode(osc1);
      instance.addNode(gain1);
      instance.addNode(osc2);
      instance.addNode(gain2);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * popup_open: 弹窗打开
     * 弹出式窗口打开音效
     */
    popup_open(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'popup_open', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.25
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 上升扫频
      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

      const env = new Envelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.4,
        release: 0.1,
        peak: 0.2
      });
      env.applyTo(mainGain.gain, now, 0.15);

      // 添加噪声质感（嗖的一声）
      const noise = manager._getNoise('white');
      const noiseSource = noise.createSource();
      const noiseGain = manager.pool.getGain();
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.Q.value = 5;
      noiseFilter.frequency.setValueAtTime(500, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(2000, now + 0.15);

      const noiseEnv = new Envelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.08,
        peak: 0.08
      });
      noiseEnv.applyTo(noiseGain.gain, now, 0.15);

      osc.connect(mainGain);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(mainGain);

      osc.start(now);
      noiseSource.start(now);
      osc.stop(now + 0.25);
      noiseSource.stop(now + 0.25);

      instance.addNode(osc);
      instance.addNode(noiseSource);
      instance.addNode(noiseGain);
      instance.addNode(noiseFilter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * popup_close: 弹窗关闭
     * 弹窗关闭音效
     */
    popup_close(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'popup_close', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.2
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 下降扫频
      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);

      const env = new Envelope({
        attack: 0.005,
        decay: 0.08,
        sustain: 0.3,
        release: 0.08,
        peak: 0.18
      });
      env.applyTo(mainGain.gain, now, 0.12);

      osc.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.2);

      instance.addNode(osc);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * swipe: 滑动/翻页声
     * 页面滑动切换音效
     */
    swipe(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'swipe', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.15
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 唰唰声 - 白噪声带通滤波
      const noise = manager._getNoise('white');
      const noiseSource = noise.createSource();
      const noiseGain = manager.pool.getGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 2;
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.linearRampToValueAtTime(4000, now + 0.1);
      filter.frequency.linearRampToValueAtTime(2000, now + 0.15);

      const env = new Envelope({
        attack: 0.01,
        decay: 0.06,
        sustain: 0.5,
        release: 0.05,
        peak: 0.06
      });
      env.applyTo(noiseGain.gain, now, 0.1);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(mainGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.15);

      instance.addNode(noiseSource);
      instance.addNode(noiseGain);
      instance.addNode(filter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * typing: 打字声
     * 键盘打字音效
     */
    typing(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'typing', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.05
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 短促的敲击声
      const osc = manager.pool.getOscillator();
      osc.type = 'square';
      osc.frequency.value = random(800, 1200);

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 500;

      const env = new Envelope({
        attack: 0.001,
        decay: 0.02,
        sustain: 0,
        release: 0.02,
        peak: 0.08
      });
      env.applyTo(mainGain.gain, now, 0.03);

      osc.connect(filter);
      filter.connect(mainGain);

      osc.start(now);
      osc.stop(now + 0.05);

      instance.addNode(osc);
      instance.addNode(filter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * success: 成功提示
     * 操作成功的提示音
     */
    success(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'success', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.3
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 上升三音
      const notes = ['C5', 'E5', 'G5'];
      const noteDelay = 0.06;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + i * noteDelay;
        const dur = 0.2;

        const env = new Envelope({
          attack: 0.005,
          decay: 0.1,
          sustain: 0.4,
          release: 0.1,
          peak: 0.25
        });
        env.applyTo(noteGain.gain, startTime, dur);

        osc.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.1);

        instance.addNode(osc);
        instance.addNode(noteGain);
      }

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * error: 错误提示
     * 操作错误的提示音
     */
    error(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'error', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.25
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 下降双音
      const osc1 = manager.pool.getOscillator();
      const gain1 = manager.pool.getGain();
      osc1.type = 'square';
      osc1.frequency.value = 400;

      const env1 = new Envelope({
        attack: 0.003,
        decay: 0.08,
        sustain: 0.5,
        release: 0.05,
        peak: 0.15
      });
      env1.applyTo(gain1.gain, now, 0.1);

      const osc2 = manager.pool.getOscillator();
      const gain2 = manager.pool.getGain();
      osc2.type = 'square';
      osc2.frequency.value = 300;

      const env2 = new Envelope({
        attack: 0.003,
        decay: 0.1,
        sustain: 0.5,
        release: 0.08,
        peak: 0.15
      });
      env2.applyTo(gain2.gain, now + 0.08, 0.12);

      // 低通滤波
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(filter);
      gain2.connect(filter);
      filter.connect(mainGain);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.25);

      instance.addNode(osc1);
      instance.addNode(gain1);
      instance.addNode(osc2);
      instance.addNode(gain2);
      instance.addNode(filter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * notification: 通知提示
     * 系统通知音效
     */
    notification(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'notification', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.6
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 经典通知声：叮-咚
      const osc1 = manager.pool.getOscillator();
      const gain1 = manager.pool.getGain();
      osc1.type = 'sine';
      osc1.frequency.value = noteToFreq('F#6');

      const env1 = new Envelope({
        attack: 0.005,
        decay: 0.2,
        sustain: 0.2,
        release: 0.15,
        peak: 0.3
      });
      env1.applyTo(gain1.gain, now, 0.2);

      const osc2 = manager.pool.getOscillator();
      const gain2 = manager.pool.getGain();
      osc2.type = 'sine';
      osc2.frequency.value = noteToFreq('B5');

      const env2 = new Envelope({
        attack: 0.005,
        decay: 0.25,
        sustain: 0.3,
        release: 0.2,
        peak: 0.25
      });
      env2.applyTo(gain2.gain, now + 0.18, 0.3);

      // 泛音
      const osc1h = manager.pool.getOscillator();
      const gain1h = manager.pool.getGain();
      osc1h.type = 'sine';
      osc1h.frequency.value = noteToFreq('F#6') * 2;

      const env1h = new Envelope({
        attack: 0.002,
        decay: 0.15,
        sustain: 0,
        release: 0.1,
        peak: 0.1
      });
      env1h.applyTo(gain1h.gain, now, 0.15);

      osc1.connect(gain1);
      gain1.connect(mainGain);
      osc2.connect(gain2);
      gain2.connect(mainGain);
      osc1h.connect(gain1h);
      gain1h.connect(mainGain);

      osc1.start(now);
      osc2.start(now + 0.18);
      osc1h.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.6);
      osc1h.stop(now + 0.25);

      instance.addNode(osc1);
      instance.addNode(gain1);
      instance.addNode(osc2);
      instance.addNode(gain2);
      instance.addNode(osc1h);
      instance.addNode(gain1h);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * level_up: 升级音效
     * 等级提升的庆祝音效
     */
    level_up(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'level_up', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.8
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 上升琶音（快速）
      const notes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6'];
      const noteDelay = 0.05;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = now + i * noteDelay;
        const dur = 0.3;

        const env = new Envelope({
          attack: 0.005,
          decay: 0.15,
          sustain: 0.3,
          release: 0.15,
          peak: 0.22
        });
        env.applyTo(noteGain.gain, startTime, dur);

        osc.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.15);

        instance.addNode(osc);
        instance.addNode(noteGain);
      }

      // 最后的闪耀音
      const sparkleOsc = manager.pool.getOscillator();
      const sparkleGain = manager.pool.getGain();
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.value = noteToFreq('E6');

      const sparkleStartTime = now + notes.length * noteDelay;
      const sparkleEnv = new Envelope({
        attack: 0.01,
        decay: 0.3,
        sustain: 0.4,
        release: 0.3,
        peak: 0.2
      });
      sparkleEnv.applyTo(sparkleGain.gain, sparkleStartTime, 0.4);

      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(mainGain);
      sparkleOsc.start(sparkleStartTime);
      sparkleOsc.stop(sparkleStartTime + 0.7);

      instance.addNode(sparkleOsc);
      instance.addNode(sparkleGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * achievement: 成就解锁
     * 成就解锁的庆祝音效
     */
    achievement(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'achievement', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 1.2
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 凯旋式和弦进行
      const chordProgressions = [
        ['C4', 'E4', 'G4'],     // C大调
        ['F4', 'A4', 'C5'],     // F大调
        ['G4', 'B4', 'D5'],     // G大调
        ['C5', 'E5', 'G5']      // C大调（高八度）
      ];
      const chordDelay = 0.25;

      for (let c = 0; c < chordProgressions.length; c++) {
        const chord = chordProgressions[c];
        const startTime = now + c * chordDelay;

        for (let i = 0; i < chord.length; i++) {
          const osc = manager.pool.getOscillator();
          const noteGain = manager.pool.getGain();
          const freq = noteToFreq(chord[i]);

          osc.type = 'triangle';
          osc.frequency.value = freq;

          const dur = 0.4;
          const env = new Envelope({
            attack: 0.02,
            decay: 0.15,
            sustain: 0.5,
            release: 0.2,
            peak: 0.15
          });
          env.applyTo(noteGain.gain, startTime, dur);

          osc.connect(noteGain);
          noteGain.connect(mainGain);

          osc.start(startTime);
          osc.stop(startTime + dur + 0.2);

          instance.addNode(osc);
          instance.addNode(noteGain);
        }
      }

      // 庆祝钟声
      const bellNotes = ['C6', 'E6', 'G6', 'C7'];
      for (let i = 0; i < bellNotes.length; i++) {
        const osc = manager.pool.getOscillator();
        const bellGain = manager.pool.getGain();
        osc.type = 'sine';
        osc.frequency.value = noteToFreq(bellNotes[i]);

        const startTime = now + 0.8 + i * 0.08;
        const dur = 0.5;

        const env = new Envelope({
          attack: 0.005,
          decay: 0.3,
          sustain: 0.2,
          release: 0.3,
          peak: 0.12
        });
        env.applyTo(bellGain.gain, startTime, dur);

        osc.connect(bellGain);
        bellGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.3);

        instance.addNode(osc);
        instance.addNode(bellGain);
      }

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * countdown: 倒计时滴答声
     * 倒计时的滴答声
     */
    countdown(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'countdown', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.1
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1000;

      const env = new Envelope({
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.03,
        peak: 0.2
      });
      env.applyTo(mainGain.gain, now, 0.06);

      osc.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.1);

      instance.addNode(osc);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * time_up: 时间到
     * 时间结束的警告音效
     */
    time_up(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'time_up', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.8
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 长鸣警报声
      const osc = manager.pool.getOscillator();
      osc.type = 'square';
      osc.frequency.value = 800;

      // 颤音效果
      const lfo = manager.pool.getOscillator();
      const lfoGain = manager.pool.getGain();
      lfo.type = 'sine';
      lfo.frequency.value = 8;
      lfoGain.gain.value = 50;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;

      const env = new Envelope({
        attack: 0.02,
        decay: 0.1,
        sustain: 0.7,
        release: 0.2,
        peak: 0.2
      });
      env.applyTo(mainGain.gain, now, 0.6);

      osc.connect(filter);
      filter.connect(mainGain);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.8);
      lfo.stop(now + 0.8);

      instance.addNode(osc);
      instance.addNode(lfo);
      instance.addNode(lfoGain);
      instance.addNode(filter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * toggle: 开关切换声
     * 开关/切换控件音效
     */
    toggle(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'toggle', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.1
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 咔哒声
      const osc = manager.pool.getOscillator();
      osc.type = 'square';
      osc.frequency.value = 600;
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 3;

      const env = new Envelope({
        attack: 0.001,
        decay: 0.06,
        sustain: 0,
        release: 0.03,
        peak: 0.15
      });
      env.applyTo(mainGain.gain, now, 0.07);

      osc.connect(filter);
      filter.connect(mainGain);

      osc.start(now);
      osc.stop(now + 0.1);

      instance.addNode(osc);
      instance.addNode(filter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * slider: 滑块声
     * 滑块拖动音效
     */
    slider(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'slider', {
        ...options,
        type: SOUND_TYPES.UI,
        duration: 0.04
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 细微的滴答声
      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.value = random(2000, 3000);

      const env = new Envelope({
        attack: 0.001,
        decay: 0.02,
        sustain: 0,
        release: 0.01,
        peak: 0.06
      });
      env.applyTo(mainGain.gain, now, 0.03);

      osc.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.04);

      instance.addNode(osc);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    }
  };

  // ============================================================
  //  游戏模式音效生成器
  // ============================================================


  // ============================================================
  //  游戏模式音效生成器
  // ============================================================

  const GameSounds = {

    /**
     * game_start: 游戏开始
     * 游戏开始的倒计时音效
     */
    game_start(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'game_start', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 1.5
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 3-2-1-GO 倒计时
      const countdownTimes = [0, 0.4, 0.8];
      for (let i = 0; i < countdownTimes.length; i++) {
        const osc = manager.pool.getOscillator();
        const tickGain = manager.pool.getGain();
        osc.type = 'sine';
        osc.frequency.value = 600;

        const startTime = now + countdownTimes[i];
        const env = new Envelope({
          attack: 0.005,
          decay: 0.15,
          sustain: 0.2,
          release: 0.1,
          peak: 0.3
        });
        env.applyTo(tickGain.gain, startTime, 0.2);

        osc.connect(tickGain);
        tickGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + 0.3);

        instance.addNode(osc);
        instance.addNode(tickGain);
      }

      // GO! 音效
      const goOsc1 = manager.pool.getOscillator();
      const goOsc2 = manager.pool.getOscillator();
      const goGain = manager.pool.getGain();
      goOsc1.type = 'square';
      goOsc1.frequency.value = noteToFreq('C5');
      goOsc2.type = 'square';
      goOsc2.frequency.value = noteToFreq('E5');

      const goTime = now + 1.0;

      const goFilter = ctx.createBiquadFilter();
      goFilter.type = 'lowpass';
      goFilter.frequency.value = 1500;

      const goEnv = new Envelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.3,
        peak: 0.3
      });
      goEnv.applyTo(goGain.gain, goTime, 0.4);

      goOsc1.connect(goFilter);
      goOsc2.connect(goFilter);
      goFilter.connect(goGain);
      goGain.connect(mainGain);

      goOsc1.start(goTime);
      goOsc2.start(goTime);
      goOsc1.stop(goTime + 0.5);
      goOsc2.stop(goTime + 0.5);

      instance.addNode(goOsc1);
      instance.addNode(goOsc2);
      instance.addNode(goGain);
      instance.addNode(goFilter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * game_over: 游戏结束
     * 游戏结束的音效
     */
    game_over(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'game_over', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 1.2
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 下行旋律
      const notes = ['G4', 'E4', 'C4', 'A3', 'F3', 'D3'];
      const noteDelay = 0.15;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = freq * 3;

        const startTime = now + i * noteDelay;
        const dur = 0.3;

        const env = new Envelope({
          attack: 0.02,
          decay: 0.15,
          sustain: 0.5,
          release: 0.15,
          peak: 0.2
        });
        env.applyTo(noteGain.gain, startTime, dur);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.15);

        instance.addNode(osc);
        instance.addNode(noteGain);
        instance.addNode(filter);
      }

      // 最后的低音
      const finalOsc = manager.pool.getOscillator();
      const finalGain = manager.pool.getGain();
      finalOsc.type = 'sine';
      finalOsc.frequency.value = noteToFreq('D3');

      const finalTime = now + notes.length * noteDelay;
      const finalEnv = new Envelope({
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 0.4,
        peak: 0.25
      });
      finalEnv.applyTo(finalGain.gain, finalTime, 0.5);

      finalOsc.connect(finalGain);
      finalGain.connect(mainGain);
      finalOsc.start(finalTime);
      finalOsc.stop(finalTime + 0.9);

      instance.addNode(finalOsc);
      instance.addNode(finalGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * combo: 连击音效（递增音调）
     * 连击计数时的音效，音调随连击数递增
     */
    combo(manager, options = {}) {
      const ctx = manager.ctx;
      const comboCount = options.comboCount || 1;
      const instance = new SoundInstance(manager, 'combo', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.2
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 基础频率随连击数上升
      const baseFreq = 400 + Math.min(comboCount, 20) * 50;
      const peak = 0.2 + Math.min(comboCount, 10) * 0.01;

      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq;
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);

      const env = new Envelope({
        attack: 0.002,
        decay: 0.08,
        sustain: 0.3,
        release: 0.08,
        peak: peak
      });
      env.applyTo(mainGain.gain, now, 0.1);

      // 泛音
      const osc2 = manager.pool.getOscillator();
      const gain2 = manager.pool.getGain();
      osc2.type = 'sine';
      osc2.frequency.value = baseFreq * 2;
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.1);

      const env2 = new Envelope({
        attack: 0.002,
        decay: 0.06,
        sustain: 0.2,
        release: 0.06,
        peak: peak * 0.4
      });
      env2.applyTo(gain2.gain, now, 0.08);

      osc.connect(mainGain);
      osc2.connect(gain2);
      gain2.connect(mainGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.2);
      osc2.stop(now + 0.15);

      instance.addNode(osc);
      instance.addNode(osc2);
      instance.addNode(gain2);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * perfect: 完美判定
     * 完美/极好判定的音效
     */
    perfect(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'perfect', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.4
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 闪亮的高音
      const notes = ['C6', 'E6', 'G6', 'C7'];
      const noteDelay = 0.03;

      for (let i = 0; i < notes.length; i++) {
        const osc = manager.pool.getOscillator();
        const noteGain = manager.pool.getGain();
        const freq = noteToFreq(notes[i]);

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + i * noteDelay;
        const dur = 0.25;

        const env = new Envelope({
          attack: 0.003,
          decay: 0.1,
          sustain: 0.4,
          release: 0.15,
          peak: 0.2
        });
        env.applyTo(noteGain.gain, startTime, dur);

        osc.connect(noteGain);
        noteGain.connect(mainGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.15);

        instance.addNode(osc);
        instance.addNode(noteGain);
      }

      // 闪光效果
      const sparkleOsc = manager.pool.getOscillator();
      const sparkleGain = manager.pool.getGain();
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.value = random(3000, 5000);
      sparkleOsc.frequency.exponentialRampToValueAtTime(random(6000, 8000), now + 0.2);

      const sparkleEnv = new Envelope({
        attack: 0.001,
        decay: 0.15,
        sustain: 0.2,
        release: 0.1,
        peak: 0.1
      });
      sparkleEnv.applyTo(sparkleGain.gain, now + 0.05, 0.2);

      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(mainGain);
      sparkleOsc.start(now + 0.05);
      sparkleOsc.stop(now + 0.3);

      instance.addNode(sparkleOsc);
      instance.addNode(sparkleGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * good: 良好判定
     * 良好/不错判定的音效
     */
    good(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'good', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.3
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 轻快的双音
      const osc1 = manager.pool.getOscillator();
      const gain1 = manager.pool.getGain();
      osc1.type = 'triangle';
      osc1.frequency.value = noteToFreq('E5');

      const env1 = new Envelope({
        attack: 0.005,
        decay: 0.12,
        sustain: 0.4,
        release: 0.1,
        peak: 0.22
      });
      env1.applyTo(gain1.gain, now, 0.15);

      const osc2 = manager.pool.getOscillator();
      const gain2 = manager.pool.getGain();
      osc2.type = 'triangle';
      osc2.frequency.value = noteToFreq('G5');

      const env2 = new Envelope({
        attack: 0.005,
        decay: 0.12,
        sustain: 0.4,
        release: 0.12,
        peak: 0.2
      });
      env2.applyTo(gain2.gain, now + 0.06, 0.15);

      osc1.connect(gain1);
      gain1.connect(mainGain);
      osc2.connect(gain2);
      gain2.connect(mainGain);

      osc1.start(now);
      osc2.start(now + 0.06);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.3);

      instance.addNode(osc1);
      instance.addNode(gain1);
      instance.addNode(osc2);
      instance.addNode(gain2);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * miss: 失误
     * 失误/错过的音效
     */
    miss(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'miss', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.3
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 嗖的一声（落空感）
      const osc = manager.pool.getOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const env = new Envelope({
        attack: 0.01,
        decay: 0.15,
        sustain: 0.2,
        release: 0.1,
        peak: 0.15
      });
      env.applyTo(mainGain.gain, now, 0.2);

      osc.connect(filter);
      filter.connect(mainGain);

      osc.start(now);
      osc.stop(now + 0.3);

      instance.addNode(osc);
      instance.addNode(filter);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * bonus: 奖励音效
     * 获得奖励的音效
     */
    bonus(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'bonus', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.6
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 金币收集式音效
      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteToFreq('C6'), now);
      osc.frequency.setValueAtTime(noteToFreq('E6'), now + 0.08);
      osc.frequency.setValueAtTime(noteToFreq('G6'), now + 0.16);
      osc.frequency.setValueAtTime(noteToFreq('C7'), now + 0.24);

      const env = new Envelope({
        attack: 0.005,
        decay: 0.1,
        sustain: 0.5,
        release: 0.2,
        peak: 0.25
      });
      env.applyTo(mainGain.gain, now, 0.4);

      // 金币叮当声
      const coinOsc = manager.pool.getOscillator();
      const coinGain = manager.pool.getGain();
      coinOsc.type = 'sine';
      coinOsc.frequency.value = noteToFreq('C7') * 2;

      const coinEnv = new Envelope({
        attack: 0.002,
        decay: 0.15,
        sustain: 0.2,
        release: 0.15,
        peak: 0.12
      });
      coinEnv.applyTo(coinGain.gain, now + 0.24, 0.2);

      osc.connect(mainGain);
      coinOsc.connect(coinGain);
      coinGain.connect(mainGain);

      osc.start(now);
      coinOsc.start(now + 0.24);
      osc.stop(now + 0.6);
      coinOsc.stop(now + 0.5);

      instance.addNode(osc);
      instance.addNode(coinOsc);
      instance.addNode(coinGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * powerup: 道具获取
     * 获得道具/能力提升的音效
     */
    powerup(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'powerup', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.7
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 上升扫频 + 颤音
      const osc = manager.pool.getOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);

      // 颤音
      const lfo = manager.pool.getOscillator();
      const lfoGain = manager.pool.getGain();
      lfo.type = 'sine';
      lfo.frequency.value = 10;
      lfoGain.gain.value = 30;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // 低通滤波
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.frequency.linearRampToValueAtTime(4000, now + 0.5);

      const env = new Envelope({
        attack: 0.02,
        decay: 0.1,
        sustain: 0.5,
        release: 0.2,
        peak: 0.2
      });
      env.applyTo(mainGain.gain, now, 0.5);

      osc.connect(filter);
      filter.connect(mainGain);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.7);
      lfo.stop(now + 0.7);

      instance.addNode(osc);
      instance.addNode(lfo);
      instance.addNode(lfoGain);
      instance.addNode(filter);

      // 结束时的爆发音
      const burstOsc = manager.pool.getOscillator();
      const burstGain = manager.pool.getGain();
      burstOsc.type = 'sine';
      burstOsc.frequency.value = 1000;

      const burstTime = now + 0.5;
      const burstEnv = new Envelope({
        attack: 0.005,
        decay: 0.15,
        sustain: 0.3,
        release: 0.15,
        peak: 0.2
      });
      burstEnv.applyTo(burstGain.gain, burstTime, 0.2);

      burstOsc.connect(burstGain);
      burstGain.connect(mainGain);
      burstOsc.start(burstTime);
      burstOsc.stop(burstTime + 0.35);

      instance.addNode(burstOsc);
      instance.addNode(burstGain);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * pause: 暂停音效
     * 游戏暂停的音效
     */
    pause(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'pause', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.3
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 下降的音调
      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      const env = new Envelope({
        attack: 0.01,
        decay: 0.15,
        sustain: 0.4,
        release: 0.1,
        peak: 0.2
      });
      env.applyTo(mainGain.gain, now, 0.2);

      osc.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.3);

      instance.addNode(osc);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * resume: 继续游戏
     * 游戏继续的音效
     */
    resume(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'resume', {
        ...options,
        type: SOUND_TYPES.GAME,
        duration: 0.3
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 上升的音调
      const osc = manager.pool.getOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);

      const env = new Envelope({
        attack: 0.01,
        decay: 0.15,
        sustain: 0.4,
        release: 0.1,
        peak: 0.2
      });
      env.applyTo(mainGain.gain, now, 0.2);

      osc.connect(mainGain);
      osc.start(now);
      osc.stop(now + 0.3);

      instance.addNode(osc);

      mainGain.gain.value = instance.volume;
      manager._connectToOutput(mainGain, instance.type);
      instance.started = true;
      instance.startTime = now;

      return instance;
    }
  };

  // ============================================================
  //  答错音效生成器
  // ============================================================


  // ============================================================
  //  环境音效生成器
  // ============================================================

  const AmbientSounds = {

    /**
     * ambient_study: 学习环境白噪音（轻微）
     * 轻微的粉噪声，适合学习背景
     */
    ambient_study(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'ambient_study', {
        ...options,
        type: SOUND_TYPES.AMBIENT,
        duration: Infinity,
        loop: true
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 粉噪声（比白噪声更柔和）
      const noise = manager._getNoise('pink');
      const noiseSource = noise.createSource();
      const noiseGain = manager.pool.getGain();

      // 低通滤波使声音更柔和
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;

      // 轻微的音量波动
      const lfo = manager.pool.getOscillator();
      const lfoGain = manager.pool.getGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1; // 0.1Hz 缓慢波动
      lfoGain.gain.value = 0.02;

      lfo.connect(lfoGain);
      lfoGain.connect(noiseGain.gain);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(mainGain);

      noiseGain.gain.value = 0.03;

      noiseSource.start(now);
      lfo.start(now);

      instance.addNode(noiseSource);
      instance.addNode(noiseGain);
      instance.addNode(filter);
      instance.addNode(lfo);
      instance.addNode(lfoGain);

      mainGain.gain.value = 0; // 初始为0，通过fadeIn渐入
      manager._connectToOutput(mainGain, instance.type);

      // 淡入
      const fadeInTime = options.fadeIn || 1;
      mainGain.gain.linearRampToValueAtTime(instance.volume, now + fadeInTime);

      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * ambient_cafe: 咖啡馆背景音
     * 模拟咖啡馆的环境噪音
     */
    ambient_cafe(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'ambient_cafe', {
        ...options,
        type: SOUND_TYPES.AMBIENT,
        duration: Infinity,
        loop: true
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 基础布朗噪声（模拟人群低沉的嗡嗡声）
      const noise = manager._getNoise('brown');
      const noiseSource = noise.createSource();
      const noiseGain = manager.pool.getGain();

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.5;

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(mainGain);

      noiseGain.gain.value = 0.04;

      instance.addNode(noiseSource);
      instance.addNode(noiseGain);
      instance.addNode(filter);

      // 偶尔的杯碟碰撞声（随机触发）
      function playClink() {
        if (instance.stopped) return;

        const osc = manager.pool.getOscillator();
        const clinkGain = manager.pool.getGain();
        osc.type = 'sine';
        osc.frequency.value = random(2000, 3500);

        const time = ctx.currentTime;
        const env = new Envelope({
          attack: 0.002,
          decay: 0.15,
          sustain: 0.1,
          release: 0.1,
          peak: random(0.02, 0.05)
        });
        env.applyTo(clinkGain.gain, time, 0.15);

        osc.connect(clinkGain);
        clinkGain.connect(mainGain);

        osc.start(time);
        osc.stop(time + 0.25);

        instance.addNode(osc);
        instance.addNode(clinkGain);

        // 随机延迟后再次触发
        const nextDelay = random(2, 6) * 1000;
        setTimeout(playClink, nextDelay);
      }

      // 启动随机杯碟声
      setTimeout(playClink, 1000);

      // 低频嗡嗡声（模拟冰箱/空调）
      const humOsc = manager.pool.getOscillator();
      const humGain = manager.pool.getGain();
      humOsc.type = 'sine';
      humOsc.frequency.value = 60;

      humGain.gain.value = 0.01;

      humOsc.connect(humGain);
      humGain.connect(mainGain);
      humOsc.start(now);

      instance.addNode(humOsc);
      instance.addNode(humGain);

      mainGain.gain.value = 0;
      manager._connectToOutput(mainGain, instance.type);

      const fadeInTime = options.fadeIn || 1.5;
      mainGain.gain.linearRampToValueAtTime(instance.volume, now + fadeInTime);

      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * ambient_nature: 自然环境音
     * 鸟鸣、风声等自然声音
     */
    ambient_nature(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'ambient_nature', {
        ...options,
        type: SOUND_TYPES.AMBIENT,
        duration: Infinity,
        loop: true
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 风声（粉噪声 + 带通滤波）
      const noise = manager._getNoise('pink');
      const windSource = noise.createSource();
      const windGain = manager.pool.getGain();
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 500;
      windFilter.Q.value = 0.3;

      // 风声的音量波动
      const windLfo = manager.pool.getOscillator();
      const windLfoGain = manager.pool.getGain();
      windLfo.type = 'sine';
      windLfo.frequency.value = 0.15;
      windLfoGain.gain.value = 0.02;

      windLfo.connect(windLfoGain);
      windLfoGain.connect(windGain.gain);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(mainGain);

      windGain.gain.value = 0.025;

      windSource.start(now);
      windLfo.start(now);

      instance.addNode(windSource);
      instance.addNode(windGain);
      instance.addNode(windFilter);
      instance.addNode(windLfo);
      instance.addNode(windLfoGain);

      // 随机鸟鸣
      function playBirdChirp() {
        if (instance.stopped) return;

        const osc = manager.pool.getOscillator();
        const chirpGain = manager.pool.getGain();
        const baseFreq = random(2000, 4000);

        osc.type = 'sine';
        osc.frequency.value = baseFreq;

        const time = ctx.currentTime;
        const chirpDuration = random(0.08, 0.2);

        // 频率波动（鸟鸣的颤音）
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.linearRampToValueAtTime(baseFreq + random(200, 500), time + chirpDuration * 0.5);
        osc.frequency.linearRampToValueAtTime(baseFreq, time + chirpDuration);

        const env = new Envelope({
          attack: 0.01,
          decay: chirpDuration * 0.4,
          sustain: 0.5,
          release: chirpDuration * 0.4,
          peak: random(0.02, 0.06)
        });
        env.applyTo(chirpGain.gain, time, chirpDuration);

        osc.connect(chirpGain);
        chirpGain.connect(mainGain);

        osc.start(time);
        osc.stop(time + chirpDuration + 0.05);

        instance.addNode(osc);
        instance.addNode(chirpGain);

        const nextDelay = random(1.5, 5) * 1000;
        setTimeout(playBirdChirp, nextDelay);
      }

      setTimeout(playBirdChirp, 2000);
      setTimeout(playBirdChirp, 3500);

      mainGain.gain.value = 0;
      manager._connectToOutput(mainGain, instance.type);

      const fadeInTime = options.fadeIn || 2;
      mainGain.gain.linearRampToValueAtTime(instance.volume, now + fadeInTime);

      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * ambient_rain: 雨声
     * 模拟下雨的环境音
     */
    ambient_rain(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'ambient_rain', {
        ...options,
        type: SOUND_TYPES.AMBIENT,
        duration: Infinity,
        loop: true
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 主雨声（白噪声 + 低通）
      const noise = manager._getNoise('white');
      const rainSource = noise.createSource();
      const rainGain = manager.pool.getGain();

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.value = 1500;
      rainFilter.Q.value = 0.5;

      // 轻微的音量波动
      const rainLfo = manager.pool.getOscillator();
      const rainLfoGain = manager.pool.getGain();
      rainLfo.type = 'sine';
      rainLfo.frequency.value = 0.2;
      rainLfoGain.gain.value = 0.02;

      rainLfo.connect(rainLfoGain);
      rainLfoGain.connect(rainGain.gain);

      rainSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(mainGain);

      rainGain.gain.value = 0.08;

      rainSource.start(now);
      rainLfo.start(now);

      instance.addNode(rainSource);
      instance.addNode(rainGain);
      instance.addNode(rainFilter);
      instance.addNode(rainLfo);
      instance.addNode(rainLfoGain);

      // 雨滴落在物体上的声音（随机）
      function playDroplet() {
        if (instance.stopped) return;

        const osc = manager.pool.getOscillator();
        const dropGain = manager.pool.getGain();
        osc.type = 'sine';

        const freq = random(800, 1500);
        osc.frequency.value = freq;
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, 0.05);

        const time = ctx.currentTime;
        const env = new Envelope({
          attack: 0.001,
          decay: 0.04,
          sustain: 0,
          release: 0.02,
          peak: random(0.01, 0.03)
        });
        env.applyTo(dropGain.gain, time, 0.05);

        osc.connect(dropGain);
        dropGain.connect(mainGain);

        osc.start(time);
        osc.stop(time + 0.08);

        instance.addNode(osc);
        instance.addNode(dropGain);

        const nextDelay = random(0.05, 0.3) * 1000;
        setTimeout(playDroplet, nextDelay);
      }

      // 启动雨滴声
      for (let i = 0; i < 3; i++) {
        setTimeout(playDroplet, i * 100);
      }

      // 低频雷声（偶尔）
      function playThunder() {
        if (instance.stopped) return;

        const thunderOsc = manager.pool.getOscillator();
        const thunderGain = manager.pool.getGain();
        thunderOsc.type = 'sawtooth';
        thunderOsc.frequency.value = 80;
        thunderOsc.frequency.exponentialRampToValueAtTime(40, 1);

        const thunderFilter = ctx.createBiquadFilter();
        thunderFilter.type = 'lowpass';
        thunderFilter.frequency.value = 200;

        const time = ctx.currentTime;
        const env = new Envelope({
          attack: 0.3,
          decay: 0.8,
          sustain: 0.3,
          release: 1,
          peak: 0.08
        });
        env.applyTo(thunderGain.gain, time, 1.5);

        thunderOsc.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.connect(mainGain);

        thunderOsc.start(time);
        thunderOsc.stop(time + 2.5);

        instance.addNode(thunderOsc);
        instance.addNode(thunderGain);
        instance.addNode(thunderFilter);

        const nextDelay = random(15, 45) * 1000;
        setTimeout(playThunder, nextDelay);
      }

      setTimeout(playThunder, 8000);

      mainGain.gain.value = 0;
      manager._connectToOutput(mainGain, instance.type);

      const fadeInTime = options.fadeIn || 2;
      mainGain.gain.linearRampToValueAtTime(instance.volume, now + fadeInTime);

      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * ambient_fire: 篝火声
     * 模拟篝火燃烧的声音
     */
    ambient_fire(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'ambient_fire', {
        ...options,
        type: SOUND_TYPES.AMBIENT,
        duration: Infinity,
        loop: true
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 火焰的基础嘶嘶声（布朗噪声）
      const noise = manager._getNoise('brown');
      const fireSource = noise.createSource();
      const fireGain = manager.pool.getGain();

      const fireFilter = ctx.createBiquadFilter();
      fireFilter.type = 'bandpass';
      fireFilter.frequency.value = 600;
      fireFilter.Q.value = 0.3;

      // 火焰的随机音量波动
      const fireLfo = manager.pool.getOscillator();
      const fireLfoGain = manager.pool.getGain();
      fireLfo.type = 'sine';
      fireLfo.frequency.value = 0.5;
      fireLfoGain.gain.value = 0.03;

      fireLfo.connect(fireLfoGain);
      fireLfoGain.connect(fireGain.gain);

      fireSource.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(mainGain);

      fireGain.gain.value = 0.06;

      fireSource.start(now);
      fireLfo.start(now);

      instance.addNode(fireSource);
      instance.addNode(fireGain);
      instance.addNode(fireFilter);
      instance.addNode(fireLfo);
      instance.addNode(fireLfoGain);

      // 噼啪声（木柴爆裂）
      function playCrackle() {
        if (instance.stopped) return;

        const noise2 = manager._getNoise('white');
        const crackleSource = noise2.createSource();
        const crackleGain = manager.pool.getGain();
        const crackleFilter = ctx.createBiquadFilter();
        crackleFilter.type = 'highpass';
        crackleFilter.frequency.value = 2000;

        const time = ctx.currentTime;
        const env = new Envelope({
          attack: 0.001,
          decay: 0.05,
          sustain: 0.2,
          release: 0.05,
          peak: random(0.02, 0.06)
        });
        env.applyTo(crackleGain.gain, time, 0.08);

        crackleSource.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(mainGain);

        crackleSource.start(time);
        crackleSource.stop(time + 0.1);

        instance.addNode(crackleSource);
        instance.addNode(crackleGain);
        instance.addNode(crackleFilter);

        const nextDelay = random(0.3, 2) * 1000;
        setTimeout(playCrackle, nextDelay);
      }

      // 启动噼啪声
      setTimeout(playCrackle, 500);
      setTimeout(playCrackle, 1200);

      // 低频火焰轰鸣
      const rumbleOsc = manager.pool.getOscillator();
      const rumbleGain = manager.pool.getGain();
      rumbleOsc.type = 'sawtooth';
      rumbleOsc.frequency.value = 60;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 100;

      rumbleGain.gain.value = 0.015;

      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(mainGain);
      rumbleOsc.start(now);

      instance.addNode(rumbleOsc);
      instance.addNode(rumbleGain);
      instance.addNode(rumbleFilter);

      mainGain.gain.value = 0;
      manager._connectToOutput(mainGain, instance.type);

      const fadeInTime = options.fadeIn || 2;
      mainGain.gain.linearRampToValueAtTime(instance.volume, now + fadeInTime);

      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * ambient_wave: 海浪声
     * 海浪拍打沙滩的声音
     */
    ambient_wave(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'ambient_wave', {
        ...options,
        type: SOUND_TYPES.AMBIENT,
        duration: Infinity,
        loop: true
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 海浪的基础噪声（粉噪声）
      const noise = manager._getNoise('pink');
      const waveSource = noise.createSource();
      const waveGain = manager.pool.getGain();

      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.value = 800;

      // 海浪的周期性起伏
      const waveLfo = manager.pool.getOscillator();
      const waveLfoGain = manager.pool.getGain();
      waveLfo.type = 'sine';
      waveLfo.frequency.value = 0.1; // 10秒一个周期
      waveLfoGain.gain.value = 0.04;

      waveLfo.connect(waveLfoGain);
      waveLfoGain.connect(waveGain.gain);

      waveSource.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(mainGain);

      waveGain.gain.value = 0.05;

      waveSource.start(now);
      waveLfo.start(now);

      instance.addNode(waveSource);
      instance.addNode(waveGain);
      instance.addNode(waveFilter);
      instance.addNode(waveLfo);
      instance.addNode(waveLfoGain);

      // 海鸥叫声（偶尔）
      function playSeagull() {
        if (instance.stopped) return;

        const osc = manager.pool.getOscillator();
        const seagullGain = manager.pool.getGain();
        osc.type = 'sawtooth';

        const time = ctx.currentTime;
        const baseFreq = random(800, 1200);

        // 海鸥的叫声是波动的
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, time + 0.1);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, time + 0.25);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.1, time + 0.4);

        const seagullFilter = ctx.createBiquadFilter();
        seagullFilter.type = 'bandpass';
        seagullFilter.frequency.value = baseFreq * 1.5;
        seagullFilter.Q.value = 2;

        const env = new Envelope({
          attack: 0.05,
          decay: 0.15,
          sustain: 0.5,
          release: 0.15,
          peak: 0.03
        });
        env.applyTo(seagullGain.gain, time, 0.4);

        osc.connect(seagullFilter);
        seagullFilter.connect(seagullGain);
        seagullGain.connect(mainGain);

        osc.start(time);
        osc.stop(time + 0.5);

        instance.addNode(osc);
        instance.addNode(seagullGain);
        instance.addNode(seagullFilter);

        const nextDelay = random(8, 20) * 1000;
        setTimeout(playSeagull, nextDelay);
      }

      setTimeout(playSeagull, 5000);

      mainGain.gain.value = 0;
      manager._connectToOutput(mainGain, instance.type);

      const fadeInTime = options.fadeIn || 3;
      mainGain.gain.linearRampToValueAtTime(instance.volume, now + fadeInTime);

      instance.started = true;
      instance.startTime = now;

      return instance;
    },

    /**
     * ambient_forest: 森林环境音
     * 森林中的各种自然声音
     */
    ambient_forest(manager, options = {}) {
      const ctx = manager.ctx;
      const instance = new SoundInstance(manager, 'ambient_forest', {
        ...options,
        type: SOUND_TYPES.AMBIENT,
        duration: Infinity,
        loop: true
      });

      const now = ctx.currentTime;
      const mainGain = manager.pool.getGain();
      instance.gainNode = mainGain;

      // 微风声（粉噪声 + 低通）
      const noise = manager._getNoise('pink');
      const windSource = noise.createSource();
      const windGain = manager.pool.getGain();
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 300;

      const windLfo = manager.pool.getOscillator();
      const windLfoGain = manager.pool.getGain();
      windLfo.type = 'sine';
      windLfo.frequency.value = 0.08;
      windLfoGain.gain.value = 0.015;

      windLfo.connect(windLfoGain);
      windLfoGain.connect(windGain.gain);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(mainGain);

      windGain.gain.value = 0.02;

      windSource.start(now);
      windLfo.start(now);

      instance.addNode(windSource);
      instance.addNode(windGain);
      instance.addNode(windFilter);
      instance.addNode(windLfo);
      instance.addNode(windLfoGain);

      // 各种鸟叫
      const birdTypes = [
        { baseFreq: 2500, duration: 0.15, pattern: 'up' },
        { baseFreq: 1800, duration: 0.2, pattern: 'warble' },
        { baseFreq: 3200, duration: 0.1, pattern: 'chirp' }
      ];

      function playForestBird() {
        if (instance.stopped) return;

        const birdType = birdTypes[randomInt(0, birdTypes.length - 1)];
        const osc = manager.pool.getOscillator();
        const birdGain = manager.pool.getGain();
        osc.type = 'sine';

        const time = ctx.currentTime;
        const freq = birdType.baseFreq + random(-200, 200);

        if (birdType.pattern === 'up') {
          osc.frequency.setValueAtTime(freq * 0.8, time);
          osc.frequency.linearRampToValueAtTime(freq * 1.2, time + birdType.duration);
        } else if (birdType.pattern === 'warble') {
          // 颤音效果
          osc.frequency.setValueAtTime(freq, time);
          for (let i = 0; i < 4; i++) {
            const t = time + i * (birdType.duration / 4);
            osc.frequency.setValueAtTime(freq * (i % 2 === 0 ? 1 : 1.1), t);
          }
        } else {
          osc.frequency.setValueAtTime(freq, time);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.7, time + birdType.duration);
        }

        const env = new Envelope({
          attack: 0.01,
          decay: birdType.duration * 0.4,
          sustain: 0.4,
          release: birdType.duration * 0.4,
          peak: random(0.015, 0.04)
        });
        env.applyTo(birdGain.gain, time, birdType.duration);

        osc.connect(birdGain);
        birdGain.connect(mainGain);

        osc.start(time);
        osc.stop(time + birdType.duration + 0.05);

        instance.addNode(osc);
        instance.addNode(birdGain);

        const nextDelay = random(1, 4) * 1000;
        setTimeout(playForestBird, nextDelay);
      }

      setTimeout(playForestBird, 1500);
      setTimeout(playForestBird, 3000);

      // 远处的水流声
      const waterNoise = manager._getNoise('white');
      const waterSource = waterNoise.createSource();
      const waterGain = manager.pool.getGain();
      const waterFilter = ctx.createBiquadFilter();
      waterFilter.type = 'bandpass';
      waterFilter.frequency.value = 1000;
      waterFilter.Q.value = 0.5;

      waterGain.gain.value = 0.01;

      waterSource.connect(waterFilter);
      waterFilter.connect(waterGain);
      waterGain.connect(mainGain);

      waterSource.start(now);

      instance.addNode(waterSource);
      instance.addNode(waterGain);
      instance.addNode(waterFilter);

      mainGain.gain.value = 0;
      manager._connectToOutput(mainGain, instance.type);

      const fadeInTime = options.fadeIn || 2.5;
      mainGain.gain.linearRampToValueAtTime(instance.volume, now + fadeInTime);

      instance.started = true;
      instance.startTime = now;

      return instance;
    }
  };

  // ============================================================
  //  音效注册表
  // ============================================================

  const soundRegistry = {
    ...CorrectSounds,
    ...WrongSounds,
    ...UISounds,
    ...GameSounds,
    ...AmbientSounds
  };

  // 音效类型映射
  const soundTypeMap = {};
  Object.keys(CorrectSounds).forEach(k => soundTypeMap[k] = SOUND_TYPES.CORRECT);
  Object.keys(WrongSounds).forEach(k => soundTypeMap[k] = SOUND_TYPES.WRONG);
  Object.keys(UISounds).forEach(k => soundTypeMap[k] = SOUND_TYPES.UI);
  Object.keys(GameSounds).forEach(k => soundTypeMap[k] = SOUND_TYPES.GAME);
  Object.keys(AmbientSounds).forEach(k => soundTypeMap[k] = SOUND_TYPES.AMBIENT);

  // ============================================================
  //  SoundManager 主类
  // ============================================================

  
  // 波形类型常量
  const WAVE_TYPES = {
    SINE: 'sine',
    SQUARE: 'square',
    SAWTOOTH: 'sawtooth',
    TRIANGLE: 'triangle',
    CUSTOM: 'custom'
  };

  // 默认设置
  const DEFAULT_SETTINGS = {
    muted: false,
    masterVolume: 0.7,
    sfxVolume: 0.8,
    ambientVolume: 0.3,
    musicVolume: 0.5,
    uiVolume: 0.7,
    correctStyle: 'correct_1',
    wrongStyle: 'wrong_1',
    spatialEnabled: false,
    visualizerEnabled: false
  };

  // 工具函数
  function noteToFreq(note, octave) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = notes.indexOf(note);
    if (noteIndex === -1) return 440;
    return 440 * Math.pow(2, (octave - 4) + (noteIndex - 9) / 12);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function dbToGain(db) {
    return Math.pow(10, db / 20);
  }

  function gainToDb(gain) {
    return 20 * Math.log10(gain);
  }

class SoundManager extends EventEmitter {
    /**
     * 构造函数
     * @param {Object} [options] - 配置选项
     */
    constructor(options = {}) {
      super();

      this.ctx = null;
      this.masterGain = null;
      this.sfxGain = null;
      this.ambientGain = null;
      this.analyser = null;

      this.pool = null;
      this.spatial = null;
      this.visualizer = null;

      this._noiseGenerators = {};
      this._activeSounds = [];
      this._ambientSounds = {};

      this.settings = { ...DEFAULT_SETTINGS, ...options };
      this._initialized = false;
      this._unlocked = false;
    }

    /**
     * 初始化音频上下文（必须在用户交互后调用）
     */
    init() {
      if (this._initialized) return;

      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          console.warn('Web Audio API is not supported in this browser');
          return false;
        }

        this.ctx = new AudioContext();

        // 创建主增益节点
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;

        // 音效增益节点
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.settings.sfxVolume;

        // 环境音增益节点
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = this.settings.ambientVolume;

        // 分析器节点（用于可视化）
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        // 连接：sfxGain -> masterGain -> analyser -> destination
        this.sfxGain.connect(this.masterGain);
        this.ambientGain.connect(this.masterGain);
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // 初始化节点池
        this.pool = new NodePool(this.ctx, 30);

        // 初始化空间音效管理器
        this.spatial = new SpatialManager(this.ctx);
        this.spatial.setEnabled(this.settings.enable3D);

        // 初始化可视化器
        this.visualizer = new Visualizer(this.ctx);
        if (this.settings.enableVisualizer) {
          this.visualizer.enable();
        }

        this._initialized = true;
        this.emit('init', this);

        return true;
      } catch (e) {
        console.error('Failed to initialize SoundManager:', e);
        return false;
      }
    }

    /**
     * 解锁音频上下文（处理浏览器自动播放限制）
     * 应在用户交互事件中调用
     */
    unlock() {
      if (!this.ctx) {
        this.init();
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this._unlocked = true;
      this.emit('unlock', this);
    }

    /**
     * 获取噪声生成器（缓存）
     * @param {string} type - 噪声类型
     * @returns {NoiseGenerator}
     */
    _getNoise(type = 'white') {
      if (!this._noiseGenerators[type]) {
        this._noiseGenerators[type] = new NoiseGenerator(this.ctx, type, 4);
      }
      return this._noiseGenerators[type];
    }

    /**
     * 连接到输出
     * @param {AudioNode} node - 要连接的节点
     * @param {string} type - 音效类型
     */
    _connectToOutput(node, type) {
      if (type === SOUND_TYPES.AMBIENT) {
        node.connect(this.ambientGain);
      } else {
        node.connect(this.sfxGain);
      }
    }

    /**
     * 播放音效
     * @param {string} name - 音效名称
     * @param {Object} [options] - 播放选项
     * @param {number} [options.volume] - 音量 (0-1)
     * @param {number} [options.fadeIn] - 淡入时间（秒）
     * @param {number} [options.fadeOut] - 淡出时间（秒）
     * @param {boolean} [options.loop] - 是否循环
     * @param {number} [options.comboCount] - 连击数（用于combo音效）
     * @returns {SoundInstance|null}
     */
    play(name, options = {}) {
      if (!this._initialized) {
        this.init();
      }

      if (!this.ctx || !soundRegistry[name]) {
        console.warn(`Sound "${name}" not found`);
        return null;
      }

      if (this.settings.muted && soundTypeMap[name] !== SOUND_TYPES.AMBIENT) {
        return null;
      }

      // 确保音频上下文已解锁
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const generator = soundRegistry[name];
      const instance = generator(this, options);

      if (instance) {
        this._activeSounds.push(instance);

        // 播放结束后清理
        instance.onEnded(() => {
          const idx = this._activeSounds.indexOf(instance);
          if (idx !== -1) {
            this._activeSounds.splice(idx, 1);
          }
        });

        this.emit('play', { name, instance });
      }

      return instance;
    }

    /**
     * 播放答对音效（使用当前选择的风格）
     * @param {Object} [options] - 播放选项
     * @returns {SoundInstance|null}
     */
    playCorrect(options = {}) {
      return this.play(this.settings.correctStyle, options);
    }

    /**
     * 播放答错音效（使用当前选择的风格）
     * @param {Object} [options] - 播放选项
     * @returns {SoundInstance|null}
     */
    playWrong(options = {}) {
      return this.play(this.settings.wrongStyle, options);
    }

    /**
     * 播放环境音
     * @param {string} name - 环境音名称
     * @param {Object} [options] - 播放选项
     * @returns {SoundInstance|null}
     */
    playAmbient(name, options = {}) {
      // 先停止同类型的环境音
      if (this._ambientSounds[name]) {
        this._ambientSounds[name].stop(0.5);
        delete this._ambientSounds[name];
      }

      const instance = this.play(name, options);
      if (instance) {
        this._ambientSounds[name] = instance;
      }
      return instance;
    }

    /**
     * 停止环境音
     * @param {string} [name] - 环境音名称，不传则停止所有
     * @param {number} [fadeTime=0.5] - 淡出时间
     */
    stopAmbient(name, fadeTime = 0.5) {
      if (name) {
        if (this._ambientSounds[name]) {
          this._ambientSounds[name].stop(fadeTime);
          delete this._ambientSounds[name];
        }
      } else {
        for (const key in this._ambientSounds) {
          this._ambientSounds[key].stop(fadeTime);
        }
        this._ambientSounds = {};
      }
    }

    /**
     * 停止所有音效
     * @param {number} [fadeTime] - 淡出时间
     */
    stopAll(fadeTime) {
      for (const instance of [...this._activeSounds]) {
        instance.stop(fadeTime);
      }
      this._activeSounds = [];
      this._ambientSounds = {};
    }

    /**
     * 设置音量
     * @param {string} type - 音量类型: 'master', 'sfx', 'ambient'
     * @param {number} value - 音量值 (0-1)
     */
    setVolume(type, value) {
      value = clamp(value, 0, 1);

      switch (type) {
        case 'master':
          this.settings.masterVolume = value;
          if (this.masterGain && !this.settings.muted) {
            this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
          }
          break;

        case 'sfx':
          this.settings.sfxVolume = value;
          if (this.sfxGain) {
            this.sfxGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
          }
          break;

        case 'ambient':
          this.settings.ambientVolume = value;
          if (this.ambientGain) {
            this.ambientGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
          }
          break;
      }

      this.emit('volumechange', { type, value });
    }

    /**
     * 获取音量
     * @param {string} type - 音量类型
     * @returns {number}
     */
    getVolume(type) {
      switch (type) {
        case 'master':
          return this.settings.masterVolume;
        case 'sfx':
          return this.settings.sfxVolume;
        case 'ambient':
          return this.settings.ambientVolume;
        default:
          return 0;
      }
    }

    /**
     * 切换静音
     * @param {boolean} [muted] - 静音状态，不传则切换
     * @returns {boolean} 新的静音状态
     */
    toggleMute(muted) {
      if (muted === undefined) {
        muted = !this.settings.muted;
      }

      this.settings.muted = muted;

      if (this.masterGain) {
        const targetValue = muted ? 0 : this.settings.masterVolume;
        this.masterGain.gain.setTargetAtTime(targetValue, this.ctx.currentTime, 0.05);
      }

      this.emit('mutechange', { muted });
      return muted;
    }

    /**
     * 设置答对音效风格
     * @param {string} style - 音效名称
     */
    setCorrectStyle(style) {
      if (CorrectSounds[style]) {
        this.settings.correctStyle = style;
        this.emit('stylechange', { type: 'correct', style });
      }
    }

    /**
     * 设置答错音效风格
     * @param {string} style - 音效名称
     */
    setWrongStyle(style) {
      if (WrongSounds[style]) {
        this.settings.wrongStyle = style;
        this.emit('stylechange', { type: 'wrong', style });
      }
    }

    /**
     * 获取可用的答对音效列表
     * @returns {string[]}
     */
    getCorrectStyles() {
      return Object.keys(CorrectSounds);
    }

    /**
     * 获取可用的答错音效列表
     * @returns {string[]}
     */
    getWrongStyles() {
      return Object.keys(WrongSounds);
    }

    /**
     * 获取所有可用音效名称
     * @param {string} [type] - 按类型过滤
     * @returns {string[]}
     */
    getSoundNames(type) {
      if (!type) {
        return Object.keys(soundRegistry);
      }

      switch (type) {
        case SOUND_TYPES.CORRECT:
          return Object.keys(CorrectSounds);
        case SOUND_TYPES.WRONG:
          return Object.keys(WrongSounds);
        case SOUND_TYPES.UI:
          return Object.keys(UISounds);
        case SOUND_TYPES.GAME:
          return Object.keys(GameSounds);
        case SOUND_TYPES.AMBIENT:
          return Object.keys(AmbientSounds);
        default:
          return [];
      }
    }

    /**
     * 获取音效总数
     * @returns {number}
     */
    getSoundCount() {
      return Object.keys(soundRegistry).length;
    }

    /**
     * 启用/禁用 3D 音效
     * @param {boolean} enabled
     */
    set3DEnabled(enabled) {
      this.settings.enable3D = enabled;
      if (this.spatial) {
        this.spatial.setEnabled(enabled);
      }
    }

    /**
     * 启用/禁用可视化
     * @param {boolean} enabled
     */
    setVisualizerEnabled(enabled) {
      this.settings.enableVisualizer = enabled;
      if (this.visualizer) {
        if (enabled) {
          this.visualizer.enable();
        } else {
          this.visualizer.disable();
        }
      }
    }

    /**
     * 设置可视化画布
     * @param {HTMLCanvasElement} canvas
     */
    setVisualizerCanvas(canvas) {
      if (this.visualizer) {
        this.visualizer.setCanvas(canvas);
      }
    }

    /**
     * 获取频谱数据
     * @returns {Uint8Array}
     */
    getFrequencyData() {
      if (this.analyser) {
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        return data;
      }
      return new Uint8Array(0);
    }

    /**
     * 获取当前活跃音效数
     * @returns {number}
     */
    get activeSoundCount() {
      return this._activeSounds.length;
    }

    /**
     * 获取音频上下文状态
     * @returns {string}
     */
    get state() {
      return this.ctx ? this.ctx.state : 'uninitialized';
    }

    /**
     * 获取是否已初始化
     * @returns {boolean}
     */
    get initialized() {
      return this._initialized;
    }

    /**
     * 获取是否已静音
     * @returns {boolean}
     */
    get muted() {
      return this.settings.muted;
    }

    /**
     * 保存设置到 localStorage
     */
    saveSettings() {
      try {
        localStorage.setItem('sz_sound_settings', JSON.stringify(this.settings));
      } catch (e) {
        console.warn('Failed to save sound settings:', e);
      }
    }

    /**
     * 从 localStorage 加载设置
     */
    loadSettings() {
      try {
        const saved = localStorage.getItem('sz_sound_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          this.settings = { ...this.settings, ...settings };

          // 应用设置
          if (this._initialized) {
            this.setVolume('master', this.settings.masterVolume);
            this.setVolume('sfx', this.settings.sfxVolume);
            this.setVolume('ambient', this.settings.ambientVolume);
            if (this.settings.muted) {
              this.toggleMute(true);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load sound settings:', e);
      }
    }

    /**
     * 销毁实例，释放资源
     */
    destroy() {
      this.stopAll(0.1);
      this._noiseGenerators = {};

      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }

      this._initialized = false;
      this.emit('destroy');
    }
  }

  // ============================================================
  //  导出到命名空间
  // ============================================================

  const sounds = {
    // 主类
    SoundManager,

    // 单例实例
    _instance: null,

    /**
     * 获取单例实例
     * @returns {SoundManager}
     */
    getInstance() {
      if (!this._instance) {
        this._instance = new SoundManager();
      }
      return this._instance;
    },

    /**
     * 初始化音效系统
     * @param {Object} [options]
     * @returns {SoundManager}
     */
    init(options) {
      const instance = this.getInstance();
      if (!instance.initialized) {
        instance.init(options);
      }
      instance.loadSettings();
      return instance;
    },

    /**
     * 播放音效（快捷方式）
     * @param {string} name
     * @param {Object} [options]
     */
    play(name, options) {
      return this.getInstance().play(name, options);
    },

    /**
     * 播放答对音效
     */
    playCorrect(options) {
      return this.getInstance().playCorrect(options);
    },

    /**
     * 播放答错音效
     */
    playWrong(options) {
      return this.getInstance().playWrong(options);
    },

    /**
     * 设置音量
     */
    setVolume(type, value) {
      return this.getInstance().setVolume(type, value);
    },

    /**
     * 切换静音
     */
    toggleMute(muted) {
      return this.getInstance().toggleMute(muted);
    },

    /**
     * 停止所有音效
     */
    stopAll(fadeTime) {
      return this.getInstance().stopAll(fadeTime);
    },

    /**
     * 解锁音频（需在用户交互中调用）
     */
    unlock() {
      return this.getInstance().unlock();
    },

    // 导出常量
    SOUND_TYPES,
    WAVE_TYPES,

    // 导出工具函数
    noteToFreq,
    random,
    clamp,
    dbToGain,
    gainToDb
  };

  global.SZ.sounds = sounds;

})(window);
