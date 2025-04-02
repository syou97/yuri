// pages/index.js
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  // 状態管理
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [showApiKeyError, setShowApiKeyError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 基本設定
  const [title, setTitle] = useState('');
  const [concept, setConcept] = useState('');
  const [era, setEra] = useState([]);
  const [otherGenre, setOtherGenre] = useState('');

  // キャラクター設定
  const [characterA, setCharacterA] = useState({
    name: '',
    age: '',
    appearance: '',
    personality: ''
  });
  const [characterB, setCharacterB] = useState({
    name: '',
    age: '',
    appearance: '',
    personality: ''
  });
  const [relationship, setRelationship] = useState('');
  const [relationshipDetail, setRelationshipDetail] = useState('');

  // 物語設定
  const [themes, setThemes] = useState([]);
  const [location, setLocation] = useState([]);
  const [otherSetting, setOtherSetting] = useState('');

  // 演出・雰囲気
  const [shortDescription, setShortDescription] = useState('');
  const [sceneCount, setSceneCount] = useState('3〜5');
  const [feelings, setFeelings] = useState([]);
  const [colors, setColors] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [weather, setWeather] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState([]);
  const [otherMood, setOtherMood] = useState([]);

  // ストーリーパターン
  const [storyPattern, setStoryPattern] = useState('');

  // モデル一覧を取得するテスト関数
  const testListModels = async () => {
    try {
      console.log("モデル一覧を取得します");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );
      
      const data = await response.json();
      console.log("利用可能なモデル:", data);
      alert("利用可能なモデル: " + JSON.stringify(data.models?.map(m => m.name) || []));
    } catch (error) {
      console.error("モデル一覧取得エラー:", error);
      alert("エラー: " + error.message);
    }
  };

  // タグの選択・解除の処理関数
  const toggleTag = (tag, currentTags, setTags) => {
    if (currentTags.includes(tag)) {
      setTags(currentTags.filter(t => t !== tag));
    } else {
      setTags([...currentTags, tag]);
    }
  };

  // 物語生成関数（Gemini APIを使用）
  const generateStory = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyError(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const prompt = buildPrompt();
      console.log("送信するプロンプト:", prompt); // デバッグ用
      
      // Gemini APIエンドポイントを使用
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "あなたは百合漫画のプロットを作成する専門家です。与えられた設定とキャラクターに基づいて、感情豊かで魅力的な百合漫画のプロットを4ページ程度で作成してください。\n\n" + prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
              topP: 0.95,
            }
          }),
        }
      );
      
      console.log("APIレスポンスステータス:", response.status); // デバッグ用
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API エラー: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("APIレスポンスデータ:", data); // デバッグ用
      
      // Gemini APIのレスポンス形式に合わせた処理
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "テキストを取得できませんでした";
      setGeneratedStory(generatedText);
    } catch (error) {
      console.error('物語生成エラー:', error);
      setGeneratedStory(`エラーが発生しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // プロンプト構築関数
  const buildPrompt = () => {
    // 自動生成が必要な項目を特定
    const needAutoTitle = !title.trim();
    const needAutoConcept = !concept.trim();
    const needAutoCharacterADetails = !characterA.age || !characterA.appearance || !characterA.personality;
    const needAutoCharacterBDetails = !characterB.name || !characterB.age || !characterB.appearance || !characterB.personality;
    const needAutoRelationship = !relationship;

    let prompt = "以下の設定に基づいて、4ページ程度の百合漫画のプロットを作成してください。\n\n";
    
    // 基本設定
    prompt += "【基本設定】\n";
    prompt += needAutoTitle ? "タイトル: [自動生成してください]\n" : `タイトル: ${title}\n`;
    prompt += needAutoConcept ? "コンセプト: [自動生成してください]\n" : `コンセプト: ${concept}\n`;
    
    if (era.length > 0) {
      prompt += `設定時代: ${era.join('、')}\n`;
    } else {
      prompt += "設定時代: [適切な時代を選んでください]\n";
    }
    
    if (otherGenre) {
      prompt += `その他のジャンル: ${otherGenre}\n`;
    }
    
    // キャラクター設定
    prompt += "\n【キャラクター設定】\n";
    
    // キャラクターA
    prompt += "■キャラクターA\n";
    prompt += `名前: ${characterA.name}\n`;
    prompt += needAutoCharacterADetails ? "年齢、外見、性格: [自動生成してください]\n" : 
      `年齢: ${characterA.age}\n外見: ${characterA.appearance}\n性格: ${characterA.personality}\n`;
    
    // キャラクターB
    prompt += "\n■キャラクターB\n";
    prompt += needAutoCharacterBDetails ? "名前、年齢、外見、性格: [自動生成してください]\n" : 
      `名前: ${characterB.name}\n年齢: ${characterB.age}\n外見: ${characterB.appearance}\n性格: ${characterB.personality}\n`;
    
    // 二人の関係性
    prompt += "\n■二人の関係性\n";
    prompt += needAutoRelationship ? "関係性: [自動生成してください]\n" : `関係性: ${relationship}\n`;
    
    if (relationshipDetail) {
      prompt += `関係性の詳細: ${relationshipDetail}\n`;
    }
    
    // 物語設定
    prompt += "\n【物語設定】\n";
    
    if (themes.length > 0) {
      prompt += `テーマ: ${themes.join('、')}\n`;
    } else {
      prompt += "テーマ: [適切なテーマを選んでください]\n";
    }
    
    if (location.length > 0) {
      prompt += `舞台設定: ${location.join('、')}\n`;
    } else {
      prompt += "舞台設定: [適切な舞台を選んでください]\n";
    }
    
    if (otherSetting) {
      prompt += `その他の設定・事柄: ${otherSetting}\n`;
    }
    
    // 演出・雰囲気
    prompt += "\n【演出・雰囲気】\n";
    
    if (shortDescription) {
      prompt += `短い説明: ${shortDescription}\n`;
    }
    
    prompt += `シーン数: ${sceneCount}\n`;
    
    if (feelings.length > 0) {
      prompt += `感情: ${feelings.join('、')}\n`;
    }
    
    if (colors.length > 0) {
      prompt += `色の基調: ${colors.join('、')}\n`;
    }
    
    if (compositions.length > 0) {
      prompt += `画の構図: ${compositions.join('、')}\n`;
    }
    
    if (seasons.length > 0) {
      prompt += `季節: ${seasons.join('、')}\n`;
    }
    
    if (weather.length > 0) {
      prompt += `天気: ${weather.join('、')}\n`;
    }
    
    if (timeOfDay.length > 0) {
      prompt += `時間帯: ${timeOfDay.join('、')}\n`;
    }
    
    if (otherMood.length > 0) {
      prompt += `その他の設定: ${otherMood.join('、')}\n`;
    }
    
    // ストーリーパターン
    if (storyPattern) {
      prompt += `\n【ストーリーパターン】\n${storyPattern}\n`;
    } else {
      prompt += "\n【ストーリーパターン】\n[適切なストーリーパターンを選んでください]\n";
    }
    
    prompt += "\n以上の設定に基づいて、感情豊かで魅力的な百合漫画のプロット（4ページ程度）を作成してください。未入力の項目は適切に補完してください。ページごとの展開を明確にし、感情の変化や関係性の進展が伝わるようにしてください。";
    
    return prompt;
  };

  // クリップボードにコピーする関数
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedStory)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };

  return (
    <div className="yuri-app">
      <Head>
        <title>百合漫画ジェネレーター</title>
        <meta name="description" content="AIを使って百合漫画のプロットを自動生成" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="app-container">
        <h1 className="app-title">百合漫画ジェネレーター</h1>

        {/* Gemini APIキー入力 */}
        <div className="app-section">
          <label htmlFor="apiKey" className="input-label">
            Gemini APIキー（必須）
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-field"
            placeholder="AIzaSyA..."
          />
          {showApiKeyError && (
            <p className="error-message">
              有効なAPIキーを入力してください
            </p>
          )}
          <p className="help-text">
            * Google AI Studioから取得したGemini APIキーを入力してください
          </p>
        </div>

        {/* 基本設定セクション */}
        <div className="app-section">
          <h2 className="section-title">基本設定</h2>
          
          <div className="input-group">
            <label htmlFor="title" className="input-label">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="タイトル"
            />
          </div>

          <div className="input-group">
            <label htmlFor="concept" className="input-label">
              コンセプト
            </label>
            <textarea
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="input-field"
              placeholder="例：幼なじみの関係から恋へと発展する物語"
              rows="2"
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              設定時代
            </label>
            <div className="tag-container">
              {['現代', '近未来', '未来', '過去', '中世', '古代', 'ファンタジー'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleTag(item, era, setEra)}
                  className={`tag-button ${
                    era.includes(item)
                      ? 'tag-selected'
                      : ''
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="otherGenre" className="input-label">
              その他のジャンル（複数選択可能）
            </label>
            <input
              type="text"
              id="otherGenre"
              value={otherGenre}
              onChange={(e) => setOtherGenre(e.target.value)}
              className="input-field"
              placeholder="例：学園、ファンタジー、日常"
            />
          </div>
        </div>

        {/* キャラクター設定セクション */}
        <div className="app-section">
          <h2 className="section-title">キャラクター設定</h2>
          
          <div className="character-container">
            {/* キャラクターA */}
            <div className="character-card">
              <h3 className="character-title">キャラクターA</h3>
              
              <div className="input-group">
                <label htmlFor="charAName" className="input-label">
                  名前
                </label>
                <input
                  type="text"
                  id="charAName"
                  value={characterA.name}
                  onChange={(e) => setCharacterA({...characterA, name: e.target.value})}
                  className="input-field"
                  placeholder="名前"
                />
              </div>

              <div className="input-group">
                <label htmlFor="charAAge" className="input-label">
                  年齢
                </label>
                <select
                  id="charAAge"
                  value={characterA.age}
                  onChange={(e) => setCharacterA({...characterA, age: e.target.value})}
                  className="select-field"
                >
                  <option value="">年齢を選択</option>
                  <option value="中学生">中学生</option>
                  <option value="高校生">高校生</option>
                  <option value="大学生">大学生</option>
                  <option value="社会人">社会人</option>
                  <option value="20代前半">20代前半</option>
                  <option value="20代後半">20代後半</option>
                  <option value="30代">30代</option>
                  <option value="不明">不明/その他</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="charAAppearance" className="input-label">
                  外見
                </label>
                <select
                  id="charAAppearance"
                  value={characterA.appearance}
                  onChange={(e) => setCharacterA({...characterA, appearance: e.target.value})}
                  className="select-field"
                >
                  <option value="">外見を選択</option>
                  <option value="ロングヘア">ロングヘア</option>
                  <option value="ショートヘア">ショートヘア</option>
                  <option value="ポニーテール">ポニーテール</option>
                  <option value="ツインテール">ツインテール</option>
                  <option value="小柄">小柄</option>
                  <option value="長身">長身</option>
                  <option value="メガネ">メガネ</option>
                  <option value="制服">制服</option>
                  <option value="スーツ">スーツ</option>
                  <option value="カジュアル">カジュアル</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="charAPersonality" className="input-label">
                  性格
                </label>
                <select
                  id="charAPersonality"
                  value={characterA.personality}
                  onChange={(e) => setCharacterA({...characterA, personality: e.target.value})}
                  className="select-field"
                >
                  <option value="">性格を選択</option>
                  <option value="真面目">真面目</option>
                  <option value="明るい">明るい</option>
                  <option value="クール">クール</option>
                  <option value="内気">内気</option>
                  <option value="積極的">積極的</option>
                  <option value="ツンデレ">ツンデレ</option>
                  <option value="天然">天然</option>
                  <option value="優しい">優しい</option>
                  <option value="面倒見がいい">面倒見がいい</option>
                  <option value="頑固">頑固</option>
                </select>
              </div>
            </div>

            {/* キャラクターB */}
            <div className="character-card">
              <h3 className="character-title">キャラクターB</h3>
              
              <div className="input-group">
                <label htmlFor="charBName" className="input-label">
                  名前
                </label>
                <input
                  type="text"
                  id="charBName"
                  value={characterB.name}
                  onChange={(e) => setCharacterB({...characterB, name: e.target.value})}
                  className="input-field"
                  placeholder="名前"
                />
              </div>

              <div className="input-group">
                <label htmlFor="charBAge" className="input-label">
                  年齢
                </label>
                <select
                  id="charBAge"
                  value={characterB.age}
                  onChange={(e) => setCharacterB({...characterB, age: e.target.value})}
                  className="select-field"
                >
                  <option value="">年齢を選択</option>
                  <option value="中学生">中学生</option>
                  <option value="高校生">高校生</option>
                  <option value="大学生">大学生</option>
                  <option value="社会人">社会人</option>
                  <option value="20代前半">20代前半</option>
                  <option value="20代後半">20代後半</option>
                  <option value="30代">30代</option>
                  <option value="不明">不明/その他</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="charBAppearance" className="input-label">
                  外見
                </label>
                <select
                  id="charBAppearance"
                  value={characterB.appearance}
                  onChange={(e) => setCharacterB({...characterB, appearance: e.target.value})}
                  className="select-field"
                >
                  <option value="">外見を選択</option>
                  <option value="ロングヘア">ロングヘア</option>
                  <option value="ショートヘア">ショートヘア</option>
                  <option value="ポニーテール">ポニーテール</option>
                  <option value="ツインテール">ツインテール</option>
                  <option value="小柄">小柄</option>
                  <option value="長身">長身</option>
                  <option value="メガネ">メガネ</option>
                  <option value="制服">制服</option>
                  <option value="スーツ">スーツ</option>
                  <option value="カジュアル">カジュアル</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="charBPersonality" className="input-label">
                  性格
                </label>
                <select
                  id="charBPersonality"
                  value={characterB.personality}
                  onChange={(e) => setCharacterB({...characterB, personality: e.target.value})}
                  className="select-field"
                >
                  <option value="">性格を選択</option>
                  <option value="真面目">真面目</option>
                  <option value="明るい">明るい</option>
                  <option value="クール">クール</option>
                  <option value="内気">内気</option>
                  <option value="積極的">積極的</option>
                  <option value="ツンデレ">ツンデレ</option>
                  <option value="天然">天然</option>
                  <option value="優しい">優しい</option>
                  <option value="面倒見がいい">面倒見がいい</option>
                  <option value="頑固">頑固</option>
                </select>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="relationship" className="input-label">
              二人の関係性
            </label>
            <select
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="select-field"
            >
              <option value="">関係性を選択</option>
              <option value="クラスメイト">クラスメイト</option>
              <option value="先輩と後輩">先輩と後輩</option>
              <option value="同僚">同僚</option>
              <option value="上司と部下">上司と部下</option>
              <option value="幼馴染">幼馴染</option>
              <option value="ルームメイト">ルームメイト</option>
              <option value="ライバル">ライバル</option>
              <option value="初対面">初対面</option>
              <option value="教師と生徒">教師と生徒</option>
              <option value="同級生">同級生</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="relationshipDetail" className="input-label">
              その他の関係性詳細
            </label>
            <textarea
              id="relationshipDetail"
              value={relationshipDetail}
              onChange={(e) => setRelationshipDetail(e.target.value)}
              className="input-field"
              placeholder="二人の関係についての詳細"
              rows="2"
            />
          </div>
        </div>

        {/* 物語設定セクション */}
        <div className="app-section">
          <h2 className="section-title">物語設定</h2>
          
          <div className="input-group">
            <label className="input-label">
              テーマ
            </label>
            <div className="tag-container">
              {['純愛', '片思い', '恋愛', '友情', '青春', '成長', 'ドラマ'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleTag(item, themes, setThemes)}
                  className={`tag-button ${
                    themes.includes(item)
                      ? 'tag-selected'
                      : ''
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              舞台設定
            </label>
            <div className="tag-container">
              {['学校', '田舎', '都会', 'カフェ', '家', '職場', 'その他'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleTag(item, location, setLocation)}
                  className={`tag-button ${
                    location.includes(item)
                      ? 'tag-selected'
                      : ''
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="otherSetting" className="input-label">
              その他の設定・事柄
            </label>
            <textarea
              id="otherSetting"
              value={otherSetting}
              onChange={(e) => setOtherSetting(e.target.value)}
              className="input-field"
              placeholder="例：雨の日の出会い、互いが名前を知らないまま、時間が止まる現象"
              rows="2"
            />
          </div>
        </div>

        {/* 演出・雰囲気セクション */}
        <div className="app-section">
          <h2 className="section-title">演出・雰囲気</h2>
          
          <div className="input-group">
            <label htmlFor="shortDescription" className="input-label">
              お話しの要点
            </label>
            <input
              type="text"
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input-field"
              placeholder="短編"
            />
          </div>

          <div className="input-group">
            <label htmlFor="sceneCount" className="input-label">
              シーン数の目安（例：3〜5、短〜長）
            </label>
            <input
              type="text"
              id="sceneCount"
              value={sceneCount}
              onChange={(e) => setSceneCount(e.target.value)}
              className="input-field"
              placeholder="3〜5"
            />
          </div>

          <div className="mood-grid">
            <div className="mood-column">
              <label className="input-label">
                感情
              </label>
              <div className="tag-container">
                {['甘い', 'やさしい', '美しい', '苦しい', '切ない', '熱い', 'まぶしい', '怖い'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleTag(item, feelings, setFeelings)}
                    className={`tag-button ${
                      feelings.includes(item)
                        ? 'tag-selected'
                        : ''
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mood-column">
              <label className="input-label">
                季節
              </label>
              <div className="tag-container">
                {['春', '夏', '秋', '冬'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleTag(item, seasons, setSeasons)}
                    className={`tag-button ${
                      seasons.includes(item)
                        ? 'tag-selected'
                        : ''
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mood-grid">
            <div className="mood-column">
              <label className="input-label">
                天気
              </label>
              <div className="tag-container">
                {['晴れ', '曇り', '雨', '雪'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleTag(item, weather, setWeather)}
                    className={`tag-button ${
                      weather.includes(item)
                        ? 'tag-selected'
                        : ''
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mood-column">
              <label className="input-label">
                時間帯
              </label>
              <div className="tag-container">
                {['朝', '昼', '夕方', '夜'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleTag(item, timeOfDay, setTimeOfDay)}
                    className={`tag-button ${
                      timeOfDay.includes(item)
                        ? 'tag-selected'
                        : ''
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ストーリー・パターンセクション */}
        <div className="app-section">
          <h2 className="section-title">ストーリー・パターン</h2>
          
          <div className="pattern-buttons">
            {[
              { id: 'random', label: 'ランダム生成' },
              { id: 'meeting', label: '出会いから始まる物語' },
              { id: 'feelings', label: 'すれ違いからの和解' },
              { id: 'friends', label: '友達から恋へ' }
            ].map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                onClick={() => setStoryPattern(pattern.label)}
                className={`pattern-button ${
                  storyPattern === pattern.label
                    ? 'pattern-selected'
                    : ''
                }`}
              >
                {pattern.label}
              </button>
            ))}
          </div>
        </div>

        {/* 生成ボタン */}
        <div className="button-container">
          <button
            onClick={generateStory}
            disabled={isLoading}
            className="generate-button"
          >
            {isLoading ? (
              <span className="loading-text">
                <svg className="loading-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="loading-circle-bg" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="loading-circle-fg" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </span>
            ) : '生成する'}
          </button>
          
          <button 
            onClick={testListModels}
            className="api-test-button"
          >
            モデル一覧取得
          </button>
        </div>

        {/* 生成結果表示エリア */}
        {generatedStory && (
          <div className="result-section">
            <div className="result-header">
              <h2 className="result-title">生成されたプロット</h2>
              <button
                onClick={copyToClipboard}
                className="copy-button"
              >
                <svg className="copy-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                {copySuccess ? 'コピーしました！' : 'コピー'}
              </button>
            </div>
            <div className="result-content">
              {generatedStory}
            </div>
          </div>
        )}

        <footer className="app-footer">
          <p>このツールはGemini APIを使用して百合漫画のプロットを生成します。</p>
          <p>© 2025 百合漫画ジェネレーター - All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
}