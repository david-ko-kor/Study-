(()=>{
'use strict';
const D=window.STUDY_DATA,$=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fileButton=path=>'<button type="button" data-file="'+esc(path)+'">'+esc(path)+'</button>';
let selectedFile='index.html',selectedFeature='home';
const titles={start:'처음 10분',map:'전체 구조',screens:'화면 따라가기',files:'파일 사전',storage:'저장소 이해',ai:'AI 원리',talk:'발표·질문 연습',quiz:'이해 확인 문제'};
function view(name){
 if(!titles[name])name='start';
 document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!=='view-'+name);
 document.querySelectorAll('nav [data-view]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.view===name)));
 document.title=titles[name]+' | 속지마켓 학생 공부방';
 if(name==='files')renderFiles();
 window.scrollTo(0,0);
}
function navigate(name){location.hash=name;view(name);}
function chooseFile(path){
 const record=D.files.find(f=>f.path===path);if(!record)return;
 selectedFile=path;$('file-search').value='';$('file-category').value='';
 if(!record.core)$('only-core').checked=false;
 location.hash='file='+encodeURIComponent(path);view('files');renderDetail(record);
}
function renderFiles(){
 const query=$('file-search').value.trim().toLowerCase(),category=$('file-category').value,core=$('only-core').checked;
 const files=D.files.filter(f=>(!core||f.core)&&(!category||f.group===category)&&(!query||(f.path+' '+f.title+' '+f.role).toLowerCase().includes(query)));
 $('file-count').textContent=files.length+'件'.replace('件','개')+' 표시 / 전체 '+D.fileCount+'개 · 검색 결과에서 파일을 선택하세요.';
 $('file-list').innerHTML=files.length?files.map(f=>'<button class="file-row" type="button" aria-current="'+String(f.path===selectedFile)+'" data-file="'+esc(f.path)+'"><b>'+esc(f.path)+'</b><small>'+esc(f.title)+'</small></button>').join(''):'<p class="small">검색 결과가 없습니다. 검색어나 핵심 파일 설정을 바꿔 보세요.</p>';
 const current=D.files.find(f=>f.path===selectedFile);if(current)renderDetail(current);
}
function renderDetail(f){
 const size=f.size<1024?f.size+' B':f.size<1048576?(f.size/1024).toFixed(1)+' KB':(f.size/1048576).toFixed(1)+' MB';
 const related=D.features.filter(feature=>feature.files.includes(f.path));
 let body='<div class="badges"><span class="badge">'+esc(f.group)+'</span><span class="badge">'+esc(f.phase)+'</span><span class="badge">'+size+'</span>'+(f.core?'<span class="badge">먼저 공부할 파일</span>':'')+'</div><h2>'+esc(f.title)+'</h2><span class="file-path">'+esc(f.path)+'</span><h3>한 문장으로 설명하면</h3><p>'+esc(f.role)+'</p>';
 if(related.length){
  const preview=related[0];
  body+='<article class="screen-panel file-screen"><h3>이 파일과 연결된 실제 화면</h3><div class="screen-scroll"><img data-expand-image src="'+encodeURI('화면캡처/'+preview.image)+'" alt="'+esc(preview.title)+' 실제 캡처"></div><p>이미지를 눌러 크게 볼 수 있습니다. 긴 화면은 이미지 안쪽을 스크롤하세요.</p></article>';
 }
 body+='<h3>여기부터 읽어 보세요</h3><ul>'+f.points.map(point=>'<li>'+esc(point)+'</li>').join('')+'</ul>';
 if(related.length)body+='<h3>이 파일이 연결된 실제 화면</h3><div class="file-links">'+related.map(feature=>'<button data-feature="'+feature.id+'">'+esc(feature.title)+' 캡처</button>').join('')+'</div>';
 if(f.core){
  const words=[['getElementById','이름표(id)가 같은 화면 요소를 찾습니다.'],['addEventListener','클릭·입력 같은 일이 생겼을 때 실행할 함수를 연결합니다.'],['.value','입력란에 적힌 값을 읽거나 바꿉니다.'],['textContent','화면에 글자를 표시합니다. HTML 코드로 실행하지 않습니다.'],['localStorage.setItem','브라우저 보관함에 이름표를 붙여 저장합니다.'],['if(','조건이 맞을 때만 다음 처리를 합니다.'],['return','함수를 끝내고 필요하면 결과를 돌려줍니다.'],['.map(','배열의 항목마다 같은 작업을 해 새 배열을 만듭니다.'],['.filter(','조건에 맞는 항목만 남깁니다.'],['JSON.stringify','객체·배열을 저장할 수 있는 문자열로 바꿉니다.'],['.fit(','준비한 입력과 정답으로 모델을 학습합니다.'],['readonly','사용자가 직접 고칠 수 없는 입력란입니다.'],['<script','이 화면에 필요한 JavaScript를 불러오는 연결입니다.'],['@media','화면 너비 같은 조건에 맞는 CSS를 적용합니다.']].filter(([word])=>(f.source||'').includes(word)).slice(0,7);
  if(words.length)body+='<details><summary>코드에 나오는 말, 쉽게 읽기</summary><ul>'+words.map(([word,meaning])=>'<li><code>'+esc(word)+'</code> — '+esc(meaning)+'</li>').join('')+'</ul></details>';
 }
 if(f.highlights.length){
  body+='<h3>주요 코드와 실제 줄 번호</h3><p class="code-note">함수 전체가 아닌 읽기 시작할 부분입니다. 긴 한 줄은 450자까지만 표시합니다. 자세한 내용은 아래 원문에서 확인하세요.</p>';
  body+=f.highlights.map(block=>'<div class="code-block"><p>찾아볼 말: <code>'+esc(block.keyword)+'</code></p><div class="code-lines">'+block.lines.map(([n,line])=>'<div class="code-line"><i>'+n+'</i><span>'+esc(line)+'</span></div>').join('')+'</div></div>').join('');
 }
 body+='<details open><summary>발표에서 이렇게 질문하면?</summary><p><b>Q. '+esc(f.question)+'</b></p><p>A. '+esc(f.answer)+'</p></details>';
 if(f.source!==null){
  const label=f.mode==='full'?'파일 원문 읽기 — 실행하지 않고 글자로 표시':f.mode==='head'?'큰 표는 첫 5줄만 읽기':'모델에서 읽은 구조 요약 — 원문 줄 번호가 아닙니다';
  body+='<details><summary>'+label+'</summary>'+(f.mode!=='full'?'<p class="code-note">전체 원문은 프로그램원본 폴더에 있습니다. 학습용으로 일부만 표시합니다.</p>':'')+'<pre><code>'+esc(f.source)+'</code></pre></details>';
 }else body+='<p class="note">이미지·압축 인식 자료·큰 외부 엔진은 텍스트 전체를 싣지 않았습니다. 역할과 연결 위치를 먼저 이해하면 됩니다. 파일 원본은 함께 제공됩니다.</p>';
 body+='<p class="small">프로그램원본/'+esc(f.path)+'에 실제 사본이 있습니다. 현재 실행 코드의 연결이 과거 문서 설명보다 우선입니다.</p><a download href="'+encodeURI('프로그램원본/'+f.path)+'">이 파일 사본 내려받기</a>';
 $('file-detail').innerHTML=body;
}
function feature(id){
 const f=D.features.find(item=>item.id===id)||D.features[0];selectedFeature=f.id;
 $('feature-picker').innerHTML=D.features.map(item=>'<button data-feature="'+item.id+'" aria-current="'+String(item.id===f.id)+'">'+esc(item.title)+'</button>').join('');
 $('feature-body').innerHTML='<h2>'+esc(f.title)+'</h2><div class="feature-layout"><article class="screen-panel"><h3>실제 앱 화면 · 눌러서 크게 보기</h3><div class="screen-scroll"><img data-expand-image src="'+encodeURI('화면캡처/'+f.image)+'" alt="'+esc(f.title)+' 실제 앱 캡처"></div><p>'+esc(f.image)+' · 긴 이미지는 안쪽을 스크롤하세요.</p></article><article class="box"><h3>버튼을 누르면 일어나는 일</h3><ol>'+f.steps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol><h3>관련 파일에 대입하기</h3><div class="file-links">'+f.files.map(fileButton).join('')+'</div><div class="note">'+esc(f.note)+'</div><h3>친구에게 설명해 보기</h3><p>“사용자가 _____하면, _____ 파일이 처리하고, _____에 저장한 뒤 _____ 화면에 보여 줍니다.”</p></article></div>';
}
const pages=[['index.html','메인·상품·상세·채팅·신고·내 정보·상장',['assets/app.js','assets/pages.js']],['signup.html','회원가입 입력·숫자 확인',['assets/signup.js']],['login.html','계정 확인·로그인',['assets/login.js']],['auth.html','학생증 업로드·학교명 대조',['assets/auth.js','assets/student-ocr.js']],['product.html','제품 정보·사진 등록',['assets/product.js']],['agreement.html','판매자 작성·구매자 확인',['assets/agreement.js']],['receipt.html','완료 거래 확인증',['assets/receipt.js']]];
$('page-map').innerHTML=pages.map(([p,r,files])=>'<tr><td>'+fileButton(p)+'</td><td>'+esc(r)+'</td><td>'+files.map(fileButton).join(' ')+'</td></tr>').join('');
$('storage-rows').innerHTML=D.storage.map(([key,title,content,files])=>'<tr><td><code>'+esc(key)+'</code></td><td>'+esc(title)+'</td><td>'+esc(content)+'</td><td>'+esc(files)+'</td></tr>').join('');
$('file-total').textContent=D.fileCount;
[...new Set(D.files.map(f=>f.group))].sort().forEach(group=>{const o=document.createElement('option');o.value=group;o.textContent=group;$('file-category').appendChild(o);});
['file-search','file-category','only-core'].forEach(id=>$(id).addEventListener(id==='file-search'?'input':'change',renderFiles));
function questions(){
 const query=$('question-search').value.trim().toLowerCase();
 const records=D.questions.filter(([q,a])=>(q+' '+a).toLowerCase().includes(query));
 $('question-list').innerHTML=records.length?records.map(([q,a])=>'<details><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>').join(''):'<p>일치하는 질문이 없습니다.</p>';
}
$('question-search').addEventListener('input',questions);
$('quiz-list').innerHTML=D.quiz.map(([q,options],i)=>'<article class="quiz-card"><h2>'+(i+1)+'. '+esc(q)+'</h2>'+options.map((option,j)=>'<label><input type="radio" name="quiz-'+i+'" value="'+j+'">'+esc(option)+'</label>').join('')+'<p class="quiz-explain" id="quiz-explain-'+i+'"></p></article>').join('');
$('quiz-form').addEventListener('submit',event=>{
 event.preventDefault();let score=0,answered=0;
 D.quiz.forEach(([q,options,correct,explanation],i)=>{
  const choice=document.querySelector('input[name="quiz-'+i+'"]:checked'),right=choice&&Number(choice.value)===correct;
  if(choice)answered++;if(right)score++;
  const el=$('quiz-explain-'+i);el.className='quiz-explain '+(right?'correct':'wrong');el.textContent=(right?'맞았어요. ':choice?'다시 생각해 보세요. ':'아직 선택하지 않았어요. ')+'정답: '+options[correct]+' — '+explanation;
 });
 $('quiz-result').textContent=D.quiz.length+'문제 중 '+score+'개를 맞혔습니다. ('+answered+'개 응답) 틀린 문제의 파일 연결을 다시 설명해 보세요.';
});
$('quiz-form').addEventListener('reset',()=>{document.querySelectorAll('.quiz-explain').forEach(el=>{el.className='quiz-explain';el.textContent='';});$('quiz-result').textContent='';});
document.addEventListener('click',event=>{
 const file=event.target.closest('[data-file]');if(file){chooseFile(file.dataset.file);return;}
 const f=event.target.closest('[data-feature]');if(f){feature(f.dataset.feature);location.hash='feature='+f.dataset.feature;view('screens');return;}
 const all=event.target.closest('[data-all-files]');if(all){$('only-core').checked=false;$('file-search').value='';$('file-category').value='';navigate('files');return;}
 const core=event.target.closest('[data-core-files]');if(core){$('only-core').checked=true;navigate('files');return;}
 const v=event.target.closest('[data-view]');if(v){navigate(v.dataset.view);return;}
 if(event.target.matches('[data-expand-image]')){
  $('large-image').src=event.target.src;$('image-caption').textContent=event.target.alt+' · 실제 화면 원본';$('image-dialog').showModal();
 }
});
document.addEventListener('error',event=>{
 const image=event.target;
 if(image instanceof HTMLImageElement&&image.hasAttribute('data-expand-image')){
  const parent=image.parentElement;
  if(!parent.querySelector('.missing-image')){
   const text=document.createElement('p');text.className='note missing-image';text.textContent='캡처 이미지를 읽지 못했습니다. ZIP을 풀고 HTML·학습자료·화면캡처 폴더를 같은 위치에 두고 열어 주세요.';parent.appendChild(text);
  }
 }
},true);
$('image-close').addEventListener('click',()=>$('image-dialog').close());
function route(){
 const hash=location.hash.slice(1);
 if(hash.startsWith('file=')){
  try{const path=decodeURIComponent(hash.slice(5));if(D.files.some(f=>f.path===path)){selectedFile=path;if(!D.files.find(f=>f.path===path).core)$('only-core').checked=false;view('files');return;}}catch{}
 }
 if(hash.startsWith('feature=')){feature(hash.slice(8));view('screens');return;}
 view(hash||'start');
}
window.addEventListener('hashchange',route);feature(selectedFeature);questions();route();
})();
