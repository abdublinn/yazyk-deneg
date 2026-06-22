// Генератор статического сайта брошюры «Мебельщикам в кризис 2»
// Никаких зависимостей — чистый Node.js

const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const BROCH = path.join(BASE, '..', '_брошюра3');
const RAW = path.join(BROCH, 'raw');
const ART_OUT = path.join(BASE, 'articles');
const META = JSON.parse(fs.readFileSync(path.join(BROCH, 'metadata.json'), 'utf8'));

// Показываем только написанные главы (raw/NN.md существует), книга растёт
META.parts = META.parts
  .map(p => ({ ...p, articles: p.articles.filter(n => fs.existsSync(path.join(RAW, `${n}.md`))) }))
  .filter(p => p.articles.length > 0);

const SITE_TITLE = META.title;
const SITE_SUBTITLE = META.subtitle;
const AUTHOR = META.author;
const PDF_NAME = META.outputFilename.replace(/\.docx$/i, '.pdf');
const sizeMB = (p) => (fs.statSync(p).size / 1048576).toFixed(1);

// ════════ Интерактивные графики (статья «Что такое конверсия») ════════
// Подключаются только на странице статьи, где есть плейсхолдеры [[EMBED:id]].
// Рисующий скрипт лежит в assets/charts-konv.js (извлечён из исходной HTML-статьи).
const CHARTS_CSS = `<style>
  .article__body figure{margin:2.2rem 0;}
  .article__body .figttl{font-family:var(--font-ui);font-size:.95rem;font-weight:600;color:var(--text);margin:0 0 .25rem;}
  .article__body .legend{display:flex;flex-wrap:wrap;gap:13px;margin:6px 0 8px;font-family:var(--font-ui);font-size:.78rem;color:var(--text-muted);}
  .article__body .legend span{display:flex;align-items:center;gap:5px;}
  .article__body .sw{width:13px;height:11px;border-radius:2px;display:inline-block;}
  .article__body .ln{width:16px;height:0;border-top:3px solid;display:inline-block;}
  .article__body .chartwrap{position:relative;width:100%;height:340px;}
  .article__body .chartwrap.sm{height:290px;}
  .article__body .chartwrap.tall{height:380px;}
  .article__body figcaption{font-family:var(--font-ui);font-size:.82rem;color:var(--text-muted);margin-top:.5rem;line-height:1.5;}
  .article__body table{border-collapse:collapse;width:100%;font-family:var(--font-ui);font-size:.85rem;margin:1.2rem 0;}
  .article__body th,.article__body td{padding:8px 10px;border:1px solid var(--rule);text-align:center;}
  .article__body th{background:var(--bg-muted);font-weight:600;font-size:.8rem;}
  .article__body td.h{text-align:left;font-weight:600;background:var(--bg-soft);}
  .article__body .hm{display:grid;gap:2px;font-size:9.5px;overflow-x:auto;}
  .article__body .hm .lbl{display:flex;align-items:center;justify-content:flex-end;padding-right:5px;font-weight:600;white-space:nowrap;}
  .article__body .hm .colh{height:54px;display:flex;align-items:flex-end;justify-content:center;}
  .article__body .hm .colh span{writing-mode:vertical-rl;transform:rotate(180deg);color:var(--text-muted);font-size:9px;}
  .article__body .hm .c{height:19px;display:flex;align-items:center;justify-content:center;border-radius:2px;}
  .article__body .mwrap{overflow-x:auto;margin:6px 0;}
  .article__body .cap{font-size:.8rem;color:var(--text-muted);margin:6px 0;}
  .article__body .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;}
  .article__body .role{color:var(--text-muted);font-size:.82em;}
  .article__body .toggle{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;}
  .article__body .toggle button{font:inherit;font-size:.78rem;padding:6px 12px;border:1px solid var(--rule);background:#fff;color:var(--text-muted);border-radius:20px;cursor:pointer;}
  .article__body .toggle button.on{background:var(--accent,#185FA5);border-color:var(--accent,#185FA5);color:#fff;font-weight:600;}
  .article__body table.mx{border-collapse:collapse;width:100%;font-size:12px;margin:0;}
  .article__body table.mx th,.article__body table.mx td{padding:4px 6px;text-align:center;border:0;border-bottom:1px solid var(--rule);white-space:nowrap;}
  .article__body table.mx thead th{color:var(--text-muted);font-weight:600;font-size:10.5px;border-bottom:2px solid var(--rule);background:transparent;}
  .article__body table.mx .wd{font-weight:400;color:var(--text-muted);font-size:9px;}
  .article__body table.mx td.mn{text-align:left;}
  .article__body table.mx td.sm{font-weight:600;background:var(--bg-soft);}
  .article__body table.mx td.zero{color:#cfd2d6;}
  .article__body table.mx tr.zrow td{background:var(--bg-muted);font-weight:600;text-align:left;color:var(--text);border-left:3px solid var(--zc);}
  .article__body table.rf,.article__body table.rl{border-collapse:collapse;width:100%;font-size:13px;margin:.6rem 0;}
  .article__body table.rf th,.article__body table.rf td,.article__body table.rl th,.article__body table.rl td{padding:5px 9px;text-align:right;border:0;border-bottom:1px solid var(--rule);}
  .article__body table.rf th:first-child,.article__body table.rf td:first-child,.article__body table.rl th:first-child,.article__body table.rl td:first-child,.article__body table.rl th:nth-child(2),.article__body table.rl td:nth-child(2){text-align:left;}
  .article__body table.rf thead th,.article__body table.rl thead th{color:var(--text-muted);font-weight:600;font-size:11px;border-bottom:2px solid var(--rule);background:transparent;}
  .article__body table.rf td.pos{color:#27500A;} .article__body table.rf td.neg{color:#791F1F;} .article__body table.rf td.fw{color:#185FA5;font-weight:600;}
  .article__body .bk{display:grid;grid-template-columns:150px 1fr 36px;align-items:center;gap:10px;margin:5px 0;font-size:12.5px;}
  .article__body .bk .bkn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .article__body .bkbar{display:flex;height:18px;border-radius:3px;overflow:hidden;background:var(--bg-muted);min-width:2px;}
  .article__body .bkbar .seg{display:block;}
  .article__body .bk .bkt{text-align:right;font-weight:600;}
</style>`;

const EMBEDS = {
  pA1: `<figure>
  <div class="figttl">Воронка по месяцам прихода лида</div>
  <div class="legend">
    <span><span class="sw" style="background:rgba(133,183,235,0.6)"></span>Вход, лидов шт (правая ось)</span>
    <span><span class="sw" style="background:#639922"></span>Лид→Сделка</span>
    <span><span class="sw" style="background:#534AB7"></span>Сделка→Договор</span>
    <span><span class="sw" style="background:#888780"></span>Отсеяно</span>
  </div>
  <div class="chartwrap"><canvas id="pA1"></canvas></div>
  <figcaption>За год видно главное: поток ровный, отсев к концу года снижается (примерно с 40% до 25%), а Лид→Сделка наоборот подрастает (с 62% до 72%). Серым выделены свежие месяцы: их сделки ещё дозревают, и недозревание тянет вниз только Сделку→Договор и сквозную, а Лид→Сделка от него не страдает, она случается быстро. Самое нестабильное звено это Сделка→Договор, с заметным провалом в мае.</figcaption>
</figure>`,
  pA2: `<figure>
  <div class="figttl">Выход в деньгах, по месяцу подписания договора</div>
  <div class="legend">
    <span><span class="sw" style="background:#378ADD"></span>Сегмент А (корпус)</span>
    <span><span class="sw" style="background:#1D9E75"></span>Сегмент Б (кухни)</span>
  </div>
  <div class="chartwrap"><canvas id="pA2"></canvas></div>
  <figcaption>Тот же бизнес, другая координата. Здесь месяц это момент, когда договор подписан, а не когда пришёл лид. Именно это и есть фактическая выручка периода, та, что попадает в кассу.</figcaption>
</figure>`,
  cells: `<table>
  <tr><th></th><th>Доля, %</th><th>Срок, дни</th><th>Деньги, ₽</th></tr>
  <tr><td class="h">Лид→Сделка</td><td>% взятых в работу</td><td>скорость квалификации</td><td>(не считаем)</td></tr>
  <tr><td class="h">Сделка→Договор</td><td>% доведённых</td><td>длина сделки</td><td>сумма договоров</td></tr>
  <tr><td class="h">Лид→Договор</td><td>сквозная конверсия</td><td>срок вызревания</td><td>выручка с потока</td></tr>
</table>`,
  pMat: `<figure>
  <div class="figttl">Как дозревает конверсия одной когорты (январские лиды)</div>
  <div class="legend">
    <span><span class="sw" style="background:rgba(24,95,165,0.5)"></span>дошло до договора, % от когорты</span>
    <span><span class="ln" style="border-color:#888780;border-top-style:dashed"></span>плато: настоящая конверсия</span>
  </div>
  <div class="chartwrap sm"><canvas id="pMat"></canvas></div>
  <figcaption>Ось снизу это месяцы с прихода лида. В нулевой месяц (для декабрьской когорты это январь) видно около 12%, через два месяца (март) уже 23%, а на настоящие 27% кривая выходит только к пятому-шестому месяцу, то есть к лету. Пока когорта не вышла на плато, любое её число это промежуточный и заниженный результат.</figcaption>
</figure>`,
  pA3: `<figure>
  <div class="figttl">Деньги и срок вместе, по месяцу подписания</div>
  <div class="legend">
    <span><span class="sw" style="background:rgba(29,158,117,0.45)"></span>Выручка, млн ₽ (правая)</span>
    <span><span class="ln" style="border-color:#185FA5"></span>Медиана срока, дн</span>
    <span><span class="ln" style="border-color:#D85A30;border-top-style:dashed"></span>Среднее срока, дн</span>
  </div>
  <div class="chartwrap"><canvas id="pA3"></canvas></div>
  <figcaption>Медиана (синяя) держится в узком коридоре: типичная сделка закрывается недели за две-три. А среднее (оранжевая) в два-три раза выше и скачет от месяца к месяцу, потому что его задаёт длинный хвост давно пришедших лидов.</figcaption>
</figure>`,
  pA4: `<figure>
  <div class="figttl">Две координаты раздельно, каждая со своей осью</div>
  <div class="legend">
    <span><span class="sw" style="background:#639922"></span>Лид→Сделка</span>
    <span><span class="sw" style="background:#534AB7"></span>Сделка→Договор</span>
    <span><span class="sw" style="background:#888780"></span>Отсеяно</span>
    <span style="color:var(--text-muted)">ось: месяц прихода лида</span>
  </div>
  <div class="chartwrap sm"><canvas id="pA4a"></canvas></div>
  <div class="legend" style="margin-top:14px;">
    <span><span class="ln" style="border-color:#185FA5"></span>Медиана срока</span>
    <span><span class="ln" style="border-color:#D85A30;border-top-style:dashed"></span>Среднее срока</span>
    <span style="color:var(--text-muted)">ось: месяц подписания договора</span>
  </div>
  <div class="chartwrap sm"><canvas id="pA4b"></canvas></div>
  <figcaption>Сверху вход, по приходу лида. Снизу выход, по подписанию договора. Один и тот же «январь» сверху и снизу это разные сделки, поэтому читать вертикаль через оба графика нельзя при всём желании.</figcaption>
</figure>`,
  pHeat: `<figure>
  <div class="figttl">Из лидов какого возраста собраны договоры</div>
  <figcaption style="margin:0 0 8px;">Строки это месяц подписания, столбцы это месяц прихода лида, число и цвет это количество договоров. Яркая диагональ означает свежие лиды, а шлейф влево означает дожим старой базы.</figcaption>
  <div id="pHeat"></div>
  <figcaption>Около четырёх пятых договоров каждый месяц приходят из лидов текущего и прошлого месяца, это и есть диагональ. Но устойчивый шлейф слева от неё это «старая база» возрастом три месяца и больше. Два месяца с одинаковым итогом запросто имеют разную долю свежего и старого, и стоят за ними разные истории.</figcaption>
</figure>`,
  pA6: `<figure>
  <div class="figttl">Сегмент А (корпус): вход и конверсии</div>
  <div class="legend">
    <span><span class="sw" style="background:rgba(133,183,235,0.6)"></span>Вход</span>
    <span><span class="sw" style="background:#639922"></span>Лид→Сделка</span>
    <span><span class="sw" style="background:#534AB7"></span>Сделка→Договор</span>
    <span><span class="sw" style="background:#888780"></span>Отсеяно</span>
  </div>
  <div class="chartwrap sm"><canvas id="pA6"></canvas></div>
</figure>`,
  pA7: `<figure>
  <div class="figttl">Сегмент Б (кухни): вход и конверсии</div>
  <div class="legend">
    <span><span class="sw" style="background:rgba(133,183,235,0.6)"></span>Вход</span>
    <span><span class="sw" style="background:#639922"></span>Лид→Сделка</span>
    <span><span class="sw" style="background:#534AB7"></span>Сделка→Договор</span>
    <span><span class="sw" style="background:#888780"></span>Отсеяно</span>
  </div>
  <div class="chartwrap sm"><canvas id="pA7"></canvas></div>
  <figcaption>Сегмент Б заметно сильнее на входе: Лид→Сделка доходит до 80%, отсев падает до 19%. А у сегмента А отсев держится в коридоре 25-48%. «Средняя конверсия по компании» усреднила две разные машины и сделала вид, что машина одна.</figcaption>
</figure>`,
  simpson: `<table>
  <tr><th>Конверсия лид→договор</th><th>Прошлый месяц</th><th>Этот месяц</th><th>Куда поехало</th></tr>
  <tr><td class="h">Корпус</td><td>45 из 150 = 30%</td><td>14 из 50 = 28%</td><td>упала</td></tr>
  <tr><td class="h">Кухни</td><td>30 из 50 = 60%</td><td>87 из 150 = 58%</td><td>упала</td></tr>
  <tr><td class="h">Вся компания</td><td>75 из 200 = 37,5%</td><td>101 из 200 = 50,5%</td><td>выросла</td></tr>
</table>`,
  pNaive: `<figure>
  <div class="figttl">Конверсия «в лоб»: договоры месяца, делённые на лиды месяца</div>
  <div class="legend">
    <span><span class="ln" style="border-color:#C0392B"></span>конверсия «в лоб», %</span>
    <span><span class="ln" style="border-color:#185FA5;border-top-style:dashed"></span>уровень зрелой когорты (≈27%)</span>
  </div>
  <div class="chartwrap sm"><canvas id="pNaive"></canvas></div>
  <figcaption>Та же компания, тот же год, а линия скачет от 27% до 81%. Декабрьский всплеск до 81% это не прорыв в продажах, а арифметика: лидов в декабре вошло мало (мёртвый сезон), зато закрыли гору давно висевших договоров, и одно поделили на другое. Эта кривая не описывает ни один реальный поток лидов, она описывает лишь то, как неудачно совпали числитель и знаменатель.</figcaption>
</figure>`,
  well: `<figure>
  <div class="figttl">Эффект вычерпанного колодца: на что любуются и за что платят</div>
  <svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:inherit;">
    <line x1="40" y1="170" x2="685" y2="170" stroke="#888780" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="44" y="162" fill="#8a909a" font-size="12">обычный уровень показателя</text>
    <path d="M40,170 L250,170 C278,170 298,62 322,60 C342,58 356,118 366,170 Z" fill="rgba(216,90,48,0.16)"/>
    <path d="M366,170 C378,214 402,250 442,250 C524,250 606,176 685,168 L685,170 L366,170 Z" fill="rgba(24,95,165,0.12)"/>
    <path d="M40,170 L250,170 C278,170 298,62 322,60 C342,58 356,118 366,170 C378,214 402,250 442,250 C524,250 606,176 685,168" fill="none" stroke="#185FA5" stroke-width="2.6"/>
    <line x1="250" y1="46" x2="250" y2="276" stroke="#5b626b" stroke-width="1.4" stroke-dasharray="3 3"/>
    <text x="246" y="40" text-anchor="end" fill="#5b626b" font-size="12.5" font-weight="600">нанят консультант</text>
    <text x="292" y="48" fill="#D85A30" font-size="12.5" font-weight="600">пик, которым любуются</text>
    <text x="392" y="272" fill="#185FA5" font-size="12.5" font-weight="600">откат ниже нормы: расплата</text>
    <text x="556" y="158" fill="#8a909a" font-size="12">сюда всё и вернётся</text>
  </svg>
  <figcaption>Схема, а не данные. Показатель не вырос, его перераспределили во времени: пик слева оплачен провалом справа, а устойчивый уровень остался тем же. Настоящий рост сдвинул бы вверх всю линию, а не подбросил бы один месяц.</figcaption>
</figure>`,
  cFlow: `<figure>
  <div class="figttl">Недельный поток воронки сделок</div>
  <div class="legend">
    <span><span class="ln" style="border-color:#185FA5"></span>Активных на начало</span>
    <span><span class="ln" style="border-color:#85B7EB;border-top-style:dashed"></span>Активных на конец</span>
    <span><span class="sw" style="background:#639922"></span>Пришло</span>
    <span><span class="sw" style="background:#534AB7"></span>Дальше / успех</span>
    <span><span class="sw" style="background:#C0392B"></span>Отсев</span>
  </div>
  <div class="chartwrap"><canvas id="cFlow"></canvas></div>
  <figcaption>Линии показывают, сколько сделок активно в воронке на начало и конец каждой недели, столбцы это недельный поток: сколько пришло новых, сколько ушло дальше или в производство, сколько отсеялось. За двенадцать недель видно, что поток ровный: приходит несколько десятков сделок в неделю, примерно столько же уходит. Воронка дышит, но в среднем держится около четырёхсот активных.</figcaption>
</figure>`,
  cComp: `<figure>
  <div class="figttl">Состав воронки по стадиям (остаток на конец недели)</div>
  <div class="legend">
    <span><span class="sw" style="background:#B4B2A9"></span>Заказ в работе</span>
    <span><span class="sw" style="background:#85B7EB"></span>Записан на замер</span>
    <span><span class="sw" style="background:#1D9E75"></span>Предв. встреча</span>
    <span><span class="sw" style="background:#97C459"></span>Повторная встреча</span>
    <span><span class="sw" style="background:#EF9F27"></span>Ожидаем решение</span>
    <span><span class="sw" style="background:#D85A30"></span>Отложено</span>
    <span><span class="sw" style="background:#534AB7"></span>Заключён договор</span>
  </div>
  <div class="chartwrap"><canvas id="cComp"></canvas></div>
  <figcaption>Та же воронка, но видно её устройство: каждый цвет это отдельная стадия, высота это сколько сделок в ней застряло на конец недели. Общая высота держится ровно, а вот пропорции плывут. Тёплая полоса «Отложено» медленно, но верно толстеет, пока остальные стоят на месте.</figcaption>
</figure>`,
  cPark: `<figure>
  <div class="figttl">Что происходит на стадии «отложено» неделя за неделей</div>
  <div class="legend">
    <span><span class="sw" style="background:#D85A30"></span>Втекло в «Отложено»</span>
    <span><span class="sw" style="background:#534AB7"></span>Ушло вперёд, к договору</span>
  </div>
  <div class="chartwrap sm"><canvas id="cPark"></canvas></div>
  <figcaption>Каждую неделю в отсек заезжают новые сделки (тёплые столбцы), а вперёд, к договору, не уходит почти никто (фиолетовые столбцы прижаты к нулю). Это не воронка, а сток без слива.</figcaption>
</figure>`,
  cInflow: `<figure>
  <div class="figttl">Динамика входящего потока за полтора года</div>
  <div class="legend">
    <span><span class="ln" style="border-color:#639922"></span>Новые лиды / нед</span>
    <span><span class="ln" style="border-color:#185FA5"></span>Новые сделки / нед</span>
    <span><span class="ln" style="border-color:#888780;border-top-style:dashed"></span>тренд (среднее за 5 нед)</span>
  </div>
  <div class="chartwrap tall"><canvas id="cInflow"></canvas></div>
  <figcaption>Понедельный график новых заявок и сделок с линией тренда. Поток держится ровно весь период: десятки заявок в неделю, без выраженного роста или спада, с предсказуемым новогодним провалом. Верх воронки здоров.</figcaption>
</figure>`,
  cYear: `<figure>
  <div class="figttl">Состав воронки за полтора года</div>
  <div class="legend">
    <span><span class="sw" style="background:#1D9E75"></span>Предв. встреча</span>
    <span><span class="sw" style="background:#EF9F27"></span>Ожидаем решение</span>
    <span><span class="sw" style="background:#D85A30"></span>Отложено</span>
    <span><span class="sw" style="background:#534AB7"></span>Заключён договор</span>
    <span style="color:var(--text-muted)">+ ранние стадии</span>
  </div>
  <div class="chartwrap tall"><canvas id="cYear"></canvas></div>
  <figcaption>Тот же разрез по стадиям, но на длинном горизонте. Видно, что «отложено» (тёплая полоса) не разовая история последних недель, а медленный тренд: отсек растёт почти весь период, вчетверо с лишним. Болото копилось давно, просто на недельном графике этого было не разглядеть.</figcaption>
</figure>`,
  mgrZones: `<figure>
  <div class="figttl">Командная выработка по неделям: сколько уходит в производство, по зонам</div>
  <div class="legend">
    <span><span class="sw" style="background:#185FA5"></span>Корпус</span>
    <span><span class="sw" style="background:#1D9E75"></span>Кухня</span>
    <span><span class="sw" style="background:#8a6d3b"></span>Техника</span>
    <span><span class="sw" style="background:#5d6d7e"></span>Лидоруб</span>
  </div>
  <div class="chartwrap"><canvas id="cZones"></canvas></div>
  <figcaption>Результат воронки дают корпус и кухня. Техника закрывает мало (она допродаёт к чужим сделкам), а лидоруб не закрывает вовсе и не должен: его полоса нулевая, потому что он на входе, а не на выходе.</figcaption>
</figure>`,
  mgrMatrix: `<figure>
  <div class="figttl">Матрица движения: менеджер на неделю. Переключайте показатель</div>
  <div class="toggle" id="mToggle"></div>
  <div class="mwrap"><table class="mx" id="matrix"></table></div>
  <figcaption>Кнопки над таблицей переключают показатель: шаги по воронке, отправки в производство, новые сделки, отсев и активный остаток на конец недели. Цвет это значение за неделю, «·» это ноль. Менеджеры сгруппированы по зонам.</figcaption>
</figure>`,
  mgrStuck: `<figure>
  <div class="figttl">Та самая застывшая воронка, неделя за неделей</div>
  <div class="mwrap"><table class="rf" id="rStuck"></table></div>
  <figcaption>Остаток у человека только растёт, неделя за неделей капают новые сделки, а столбцы «вперёд» и «в производство» намертво по нулям. Сделки заходят и ложатся, как в склад без выхода.</figcaption>
</figure>`,
  mgrRoles: `<figure>
  <div class="figttl">Команда и роли: одна таблица за квартал</div>
  <div class="mwrap"><table class="rl" id="tRoles"></table></div>
  <figcaption>У лидоруба огромный остаток и ноль в производство, и это не провал, а его работа: он принимает поток и раздаёт, а не закрывает. Сравнивать его с продавцами по одному столбцу значит врать о людях.</figcaption>
</figure>`,
  mgrBacklog: `<figure>
  <div class="figttl">Из чего состоит активный остаток у команды</div>
  <div class="legend" id="bLeg"></div>
  <div id="bBacklog"></div>
  <figcaption>У лидоруба остаток набит «Записан на замер» и «Отложено», у застывшего всё стоит в самой первой стадии «Заказ в работе», у обычного продавца остаток поменьше и распределён по воронке. Один и тот же размер хвоста, а работа за ним совсем разная.</figcaption>
</figure>`
};

function embedHtml(id) {
  return EMBEDS[id] || `\n<!-- unknown embed: ${id} -->\n`;
}

const esc = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const inline = (text) => {
  text = esc(text);
  // Ссылки сначала вынимаем в плейсхолдеры, чтобы emphasis-регексы ниже не трогали
  // подчёркивания и звёздочки внутри URL (напр. .../ahw_4cQ5...) и target="_blank".
  const links = [];
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (m, label, href) => {
    links.push(`<a href="${href}" target="_blank" rel="noopener">${label}</a>`);
    return ` ${links.length - 1} `;
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[^\*])\*([^*\n]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
  text = text.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, '$1<em>$2</em>$3');
  text = text.replace(/ (\d+) /g, (m, i) => (i < links.length ? links[+i] : m));
  return text;
};

function parseArticle(num) {
  const raw = fs.readFileSync(path.join(RAW, `${num}.md`), 'utf8');
  const lines = raw.split(/\r?\n/);
  let title = '', url = '', bodyStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Title:')) title = lines[i].slice(6).trim();
    if (lines[i].startsWith('URL Source:')) url = lines[i].slice(11).trim();
    if (lines[i].startsWith('Markdown Content:')) { bodyStart = i + 1; break; }
  }
  const body = lines.slice(bodyStart).join('\n').trim();
  const urlClean = url.replace(/\?.*$/, '');
  return { num, title, url: urlClean, body, blocks: blockify(body, num) };
}

function blockify(md, articleNum) {
  const blocks = [];
  const lines = md.split('\n');
  let imgIdx = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const embMatch = line.match(/^\[\[EMBED:([a-zA-Z0-9]+)\]\]\s*$/);
    if (embMatch) { blocks.push({ type: 'embed', id: embMatch[1] }); i++; continue; }
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^\)]+)\)\s*$/);
    if (imgMatch) {
      imgIdx++;
      const local = `${articleNum}_${String(imgIdx).padStart(2, '0')}.jpg`;
      blocks.push({ type: 'img', src: local, alt: imgMatch[1] || `Иллюстрация ${imgIdx}` });
      i++; continue;
    }
    if (line.startsWith('#### ')) { blocks.push({ type: 'h4', text: line.slice(5).trim() }); i++; continue; }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', text: line.slice(4).trim() }); i++; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.slice(3).trim() }); i++; continue; }
    if (line.startsWith('# ')) { blocks.push({ type: 'h2', text: line.slice(2).trim() }); i++; continue; }
    if (/^[-_*]{3,}\s*$/.test(line)) { blocks.push({ type: 'hr' }); i++; continue; }
    if (line.startsWith('> ')) {
      const parts = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i].startsWith('>'))) {
        parts.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: parts.join(' ').trim() });
      continue;
    }
    if (/^[\*\-]\s+/.test(line) || /^\*\s{2,}/.test(line)) {
      const items = [];
      while (i < lines.length && (/^[\*\-]\s+/.test(lines[i]) || /^\*\s{2,}/.test(lines[i]) || !lines[i].trim())) {
        const ln = lines[i];
        if (!ln.trim()) { i++; continue; }
        const text = ln.replace(/^[\*\-]\s+/, '').replace(/^\*\s+/, '').trim();
        if (text) items.push(text);
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && (/^\d+\.\s+/.test(lines[i]) || !lines[i].trim())) {
        const ln = lines[i];
        if (!ln.trim()) { i++; continue; }
        items.push(ln.replace(/^\d+\.\s+/, '').trim());
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }
    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4} |> |!\[|[\*\-]\s|\*\s{2,}|[-_*]{3,}\s*$)/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 1 && (paraLines.every(l => /^—\s/.test(l.trim())) || paraLines.slice(0, -1).some(l => /\s{2,}$/.test(l)))) {
      blocks.push({ type: 'p', text: paraLines.map(l => l.trim()).join('\n'), br: true });
    } else {
      blocks.push({ type: 'p', text: paraLines.join(' ').trim() });
    }
  }
  return blocks;
}

function renderBlock(b, imgPrefix) {
  if (b.type === 'h2') return `<h2>${inline(b.text)}</h2>`;
  if (b.type === 'h3') return `<h3>${inline(b.text)}</h3>`;
  if (b.type === 'h4') return `<h4>${inline(b.text)}</h4>`;
  if (b.type === 'p') return b.br ? `<p>${b.text.split('\n').map(inline).join('<br>\n')}</p>` : `<p>${inline(b.text)}</p>`;
  if (b.type === 'quote') return `<blockquote>${inline(b.text)}</blockquote>`;
  if (b.type === 'ul') return `<ul>${b.items.map(it => `<li>${inline(it)}</li>`).join('')}</ul>`;
  if (b.type === 'ol') return `<ol>${b.items.map(it => `<li>${inline(it)}</li>`).join('')}</ol>`;
  if (b.type === 'hr') return '<hr>';
  if (b.type === 'img') return `<img src="${imgPrefix}${b.src}" alt="${esc(b.alt)}" loading="lazy">`;
  if (b.type === 'embed') return embedHtml(b.id);
  return '';
}

function blocksToHtml(blocks, opts = {}) {
  const imgPrefix = opts.imgPrefix || '../images/';
  return blocks.map(b => renderBlock(b, imgPrefix)).join('\n');
}

// Группировка блоков статьи в раскрывающиеся секции по H2.
// Всё до первого H2 — вступление (не сворачивается).
// Каждая секция: { heading: "...", blocks: [...] }
function groupIntoSections(blocks) {
  const intro = [];
  const sections = [];
  let cur = null;
  for (const b of blocks) {
    if (b.type === 'h2') {
      if (cur) sections.push(cur);
      cur = { heading: b.text, blocks: [] };
    } else {
      if (cur) cur.blocks.push(b);
      else intro.push(b);
    }
  }
  if (cur) sections.push(cur);
  return { intro, sections };
}

function articleBodyHtml(blocks, imgPrefix) {
  const { intro, sections } = groupIntoSections(blocks);
  const out = [];
  if (intro.length) out.push(intro.map(b => renderBlock(b, imgPrefix)).join('\n'));
  for (const sec of sections) {
    const inner = sec.blocks.map(b => renderBlock(b, imgPrefix)).join('\n');
    out.push(`<details class="section" open>
<summary><h2>${inline(sec.heading)}</h2></summary>
${inner}
</details>`);
  }
  return out.join('\n');
}

function readingTime(blocks) {
  const text = blocks
    .filter(b => b.text || (b.items && b.items.join))
    .map(b => b.text || b.items.join(' '))
    .join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}

function readSimpleMd(filename) {
  let raw = fs.readFileSync(path.join(BROCH, filename), 'utf8');
  raw = raw.replace(/^---[\s\S]+?---\s*/, '');
  return blockify(raw, '00');
}

// ── Sidebar ──────────────────────────────────────────────────────
// active: 'home' | 'preface' | 'about' | 'conclusion' | 'article:NN' (где NN — chapter index)
function renderSidebar(active, articlesByNum, depth = 0) {
  const up = depth === 0 ? '' : '../'.repeat(depth);
  const isActive = id => active === id ? ' class="is-active"' : '';

  let chapter = 0;
  const partsHtml = META.parts.map(part => {
    const chaptersHtml = part.articles.map(num => {
      chapter++;
      const a = articlesByNum[num];
      const chId = `article:${String(chapter).padStart(2, '0')}`;
      const fname = `${String(chapter).padStart(2, '0')}.html`;
      return `<li><a href="${up}articles/${fname}"${isActive(chId)}>${esc(a.title)}</a></li>`;
    }).join('\n');
    const partActive = chapter >= 1 && (() => {
      // часть «активна» если активная глава внутри неё
      let c = 0;
      for (const p of META.parts) {
        for (const num of p.articles) {
          c++;
          if (`article:${String(c).padStart(2, '0')}` === active && p === part) return true;
        }
      }
      return false;
    })();
    return `<details${partActive ? ' open' : ''}>
<summary><span class="sidebar__part-num">${esc(part.number)}</span> ${esc(part.title)}</summary>
<ul>
${chaptersHtml}
</ul>
</details>`;
  }).join('\n');

  return `<aside class="sidebar" id="sidebar">
  <nav class="sidebar__nav">
    <a href="${up}index.html"${isActive('home')}>Главная</a>
    <a href="${up}index.html#preface"${isActive('preface')}>Предисловие</a>

    <div class="sidebar__nav-section">Содержание</div>
    ${partsHtml}

    <a href="${up}conclusion.html"${isActive('conclusion')}>Заключение</a>

    <div class="sidebar__nav-section">Автор</div>
    <a href="${up}about.html"${isActive('about')}>Об авторе</a>
  </nav>
</aside>
<div class="sidebar-backdrop" id="sidebarBackdrop"></div>
<button class="sidebar-toggle" id="sidebarToggle" aria-label="Меню">☰</button>`;
}

const SIDEBAR_JS = `(function(){
  var t = document.getElementById('sidebarToggle');
  var s = document.getElementById('sidebar');
  var b = document.getElementById('sidebarBackdrop');
  if (!t || !s) return;
  function close(){ s.classList.remove('is-open'); b.classList.remove('is-open'); }
  function open(){ s.classList.add('is-open'); b.classList.add('is-open'); }
  t.addEventListener('click', function(){ s.classList.contains('is-open') ? close() : open(); });
  b.addEventListener('click', close);
  // закрыть по выбору пункта на мобильном
  s.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ if (window.innerWidth <= 900) close(); }); });
})();`;

const PROGRESS_JS = `(function(){
  var bar = document.getElementById('readProgress');
  if (!bar) return;
  function upd(){
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    bar.style.width = (Math.min(100, (h.scrollTop / max) * 100)) + '%';
  }
  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();`;

// ── Шаблон страницы ──────────────────────────────────────────────
function pageLayout({ title, ogDesc, content, depth = 0, active = '', includeProgress = false, extraHead = '', extraBody = '' }) {
  const up = depth === 0 ? '' : '../'.repeat(depth);
  // articlesByNum понадобится для sidebar — передаём через замыкание
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title === SITE_TITLE ? esc(`${title}. ${SITE_SUBTITLE}`) : `${esc(title)} — ${esc(SITE_TITLE)}`}</title>
<meta name="description" content="${esc(ogDesc || SITE_SUBTITLE)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(ogDesc || SITE_SUBTITLE)}">
<meta property="og:type" content="article">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}assets/styles.css">
${extraHead}
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23c75b2a'/%3E%3Ctext x='50%25' y='66%25' text-anchor='middle' fill='%23f5f0eb' font-family='Georgia' font-size='20' font-weight='700'%3EД%3C/text%3E%3C/svg%3E">
</head>
<body>
${includeProgress ? '<div class="read-progress" id="readProgress"></div>' : ''}
<div class="layout">

<header class="site-header">
  <div class="site-header__inner">
    <a class="site-header__brand" href="${up}index.html">
      ${esc(SITE_TITLE)}<span class="site-header__brand-sub">— ${esc(SITE_SUBTITLE)}</span>
    </a>
    <nav class="site-header__nav">
      <a href="${up}index.html">Главная</a>
      <a href="${up}index.html#preface">Предисловие</a>
      <a href="${up}about.html">Об авторе</a>
    </nav>
  </div>
</header>

${renderSidebar(active, GLOBAL_ARTICLES, depth)}

<main>
${content}
</main>

<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__links">
      ${AUTHOR.litresUrl ? `<a href="${esc(AUTHOR.litresUrl)}" target="_blank" rel="noopener">${esc(AUTHOR.litresLabel || 'Книга на Литресе')}</a>` : ''}
      ${AUTHOR.telegramGroupUrl ? `<a href="${esc(AUTHOR.telegramGroupUrl)}" target="_blank" rel="noopener">Телеграм-канал</a>` : ''}
      ${AUTHOR.telegramBlogUrl ? `<a href="${esc(AUTHOR.telegramBlogUrl)}" target="_blank" rel="noopener">Пятничные посты</a>` : ''}
      ${AUTHOR.dzenChannelUrl ? `<a href="${esc(AUTHOR.dzenChannelUrl)}" target="_blank" rel="noopener">Канал в Дзене</a>` : ''}
      ${AUTHOR.telegramPersonalUrl ? `<a href="${esc(AUTHOR.telegramPersonalUrl)}" target="_blank" rel="noopener">Связаться</a>` : ''}
    </div>
    <div class="site-footer__copy">© ${META.year} ${esc(AUTHOR.displayName || '')}</div>
  </div>
</footer>

</div>
<script>${SIDEBAR_JS}${includeProgress ? PROGRESS_JS : ''}</script>
${extraBody}
</body>
</html>`;
}

// Глобальная переменная для sidebar (грязно, но просто)
let GLOBAL_ARTICLES = {};

// ── Контактный блок ──────────────────────────────────────────────
function renderContactsBlock() {
  const rows = [];
  if (AUTHOR.telegramBlogUrl) rows.push({
    label: 'Телеграм-канал',
    href: AUTHOR.telegramBlogUrl,
    value: AUTHOR.telegramBlogHandle || AUTHOR.telegramBlogUrl,
    note: AUTHOR.telegramBlogDescription
  });
  if (AUTHOR.telegramGroupUrl) rows.push({
    label: 'Группа со статьями',
    href: AUTHOR.telegramGroupUrl,
    value: AUTHOR.telegramGroupHandle || AUTHOR.telegramGroupUrl,
    note: AUTHOR.telegramGroupDescription
  });
  if (AUTHOR.telegramPersonalUrl) rows.push({
    label: 'Личный Telegram',
    href: AUTHOR.telegramPersonalUrl,
    value: AUTHOR.telegramPersonalHandle || AUTHOR.telegramPersonalUrl
  });
  if (AUTHOR.dzenChannelUrl) rows.push({
    label: 'Канал на Дзене',
    href: AUTHOR.dzenChannelUrl,
    value: AUTHOR.dzenChannelLabel || AUTHOR.dzenChannelUrl
  });
  if (AUTHOR.phone) rows.push({
    label: AUTHOR.phoneLabel || 'Телефон',
    value: AUTHOR.phone,
    note: AUTHOR.phoneNote
  });
  if (AUTHOR.email) rows.push({
    label: 'Email',
    href: `mailto:${AUTHOR.email}`,
    value: AUTHOR.email
  });

  const items = rows.map(r => {
    const value = r.href
      ? `<a href="${esc(r.href)}" ${r.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(r.value)}</a>`
      : esc(r.value);
    return `<div class="contacts__row">
      <span class="contacts__label">${esc(r.label)}</span>
      <span class="contacts__value">${value}${r.note ? `<div class="contacts__note">${esc(r.note)}</div>` : ''}</span>
    </div>`;
  }).join('');

  return `<section class="contacts">
    <h3 class="contacts__title">Связь с автором</h3>
    <div class="contacts__list">${items}</div>
  </section>`;
}

// ── Главная ──────────────────────────────────────────────────────
function renderIndex(articlesByNum) {
  // Предисловие — инлайн на главной (без первого H2 «Предисловие»)
  const prefBlocks = readSimpleMd('предисловие.md').filter((b, idx) =>
    !(idx === 0 && (b.type === 'h2' || b.type === 'h3') && /^Предисловие/i.test(b.text))
  );
  const prefaceHtml = blocksToHtml(prefBlocks, { imgPrefix: 'images/' });

  // Содержание
  let chapterCounter = 0;
  const tocHtml = META.parts.map(part => {
    const chapters = part.articles.map(num => {
      chapterCounter++;
      const a = articlesByNum[num];
      const rt = readingTime(a.blocks);
      return `<a class="toc__chapter" href="articles/${String(chapterCounter).padStart(2, '0')}.html">
        <div class="toc__chapter-meta">
          <span>Глава ${chapterCounter}</span>
          <span>~${rt} мин</span>
        </div>
        <div class="toc__chapter-title">${esc(a.title)}</div>
      </a>`;
    }).join('');
    return `<section class="toc__part" id="part-${part.number.toLowerCase()}">
      <header class="toc__part-header">
        <div class="toc__part-num">Часть ${part.number}</div>
        <h3 class="toc__part-title">${esc(part.title)}</h3>
        <p class="toc__part-subtitle">${esc(part.subtitle)}</p>
      </header>
      <div class="toc__chapters">${chapters}</div>
    </section>`;
  }).join('');

  const content = `
<section class="hero">
  <div class="container">
    <div class="hero__kicker">Книга для собственника. О деньгах вашего дела.</div>
    <h1 class="hero__title">${esc(SITE_TITLE)}</h1>
    <p class="hero__subtitle">${esc(SITE_SUBTITLE)}</p>
    <p class="hero__intro">
      Книга про то, как собственнику видеть деньги своего дела: учёт, прибыль, цены и затраты. Не теория из учебника, а то, что я вынес из десяти лет работы с мебельным бизнесом. Книга растёт глава за главой.
    </p>
    <a class="hero__cta" href="#toc">К содержанию →</a>
    
    <div class="hero__author">${esc(AUTHOR.displayName)} · ${META.year}</div>
  </div>
</section>

<section class="preface-inline" id="preface">
  <div class="container">
    <h2>Предисловие</h2>
    <div class="preface-inline__body">
      ${prefaceHtml}
    </div>
  </div>
</section>

<section class="toc" id="toc">
  <div class="container">
    <h2>Содержание</h2>
    ${tocHtml}
  </div>
</section>

<section class="author">
  <div class="container">
    <div class="author__card">
      <img class="author__photo" src="images/_author.jpg" alt="${esc(AUTHOR.displayName)}">
      <div>
        <h3 class="author__name">${esc(AUTHOR.displayName)}</h3>
        <p class="author__role">${esc(AUTHOR.role || '')}</p>
        <p>Я помогаю собственникам разобраться, что на самом деле происходит в бизнесе, и превратить хаос ежедневных решений в понятную систему цифр, процессов и действий.</p>
        <p style="margin-top:1.5rem"><a href="about.html">Полная информация и контакты →</a></p>
      </div>
    </div>
    ${renderContactsBlock()}
  </div>
</section>

`;

  return pageLayout({
    title: SITE_TITLE,
    ogDesc: SITE_SUBTITLE,
    content,
    depth: 0,
    active: 'home',
    includeProgress: false
  });
}

// ── Об авторе ────────────────────────────────────────────────────
function renderAbout() {
  const bioHtml = (AUTHOR.aboutParagraphs || []).map(item => {
    if (typeof item === 'string') return `<p>${inline(item)}</p>`;
    if (item.h) return `<h3>${inline(item.h)}</h3>`;
    if (Array.isArray(item.ul)) return `<ul>${item.ul.map(li => `<li>${inline(li)}</li>`).join('')}</ul>`;
    return '';
  }).join('\n');

  const content = `
<section class="author">
  <div class="container">
    <div class="author__card">
      <img class="author__photo" src="images/_author.jpg" alt="${esc(AUTHOR.displayName)}">
      <div>
        <h1 class="author__name">${esc(AUTHOR.displayName)}</h1>
        <p class="author__role">${esc(AUTHOR.role || '')}</p>
        <div class="author__bio">${bioHtml}</div>
      </div>
    </div>
    ${renderContactsBlock()}
  </div>
</section>
`;
  return pageLayout({ title: 'Об авторе', content, depth: 0, active: 'about', includeProgress: false });
}

// ── Заключение ───────────────────────────────────────────────────
function renderConclusion(articlesByNum) {
  const trBlocks = readSimpleMd('переходы.md');
  const concludeIdx = trBlocks.findIndex(b => (b.type === 'h2' || b.type === 'h3') && /^Заключение/i.test(b.text));
  const blocks = concludeIdx >= 0 ? trBlocks.slice(concludeIdx + 1) : [];
  const bodyHtml = blocksToHtml(blocks, { imgPrefix: 'images/' });

  const lastPart = META.parts[META.parts.length - 1];
  const lastPartLast = lastPart.articles[lastPart.articles.length - 1];
  let totalIdx = 0;
  for (const p of META.parts) for (const n of p.articles) { totalIdx++; if (n === lastPartLast) break; }

  const content = `
<article class="article">
  <div class="container">
    <nav class="article__breadcrumb">
      <a href="index.html">Главная</a> <span>→</span> Заключение
    </nav>
    <header class="article__header">
      <h1 class="article__title">Заключение</h1>
    </header>
    <div class="article__body">
      ${bodyHtml}
    </div>
    <nav class="chapter-nav">
      <a class="chapter-nav__item" href="articles/${String(totalIdx).padStart(2, '0')}.html">
        <div class="chapter-nav__direction">← Глава ${totalIdx}</div>
        <div class="chapter-nav__title">${esc(articlesByNum[lastPartLast].title)}</div>
      </a>
      <a class="chapter-nav__item chapter-nav__item--next" href="about.html">
        <div class="chapter-nav__direction">Дальше →</div>
        <div class="chapter-nav__title">Об авторе</div>
      </a>
    </nav>
  </div>
</article>
`;
  return pageLayout({ title: 'Заключение', content, depth: 0, active: 'conclusion', includeProgress: true });
}

// ── Статья ───────────────────────────────────────────────────────
function renderArticle(chapterIdx, article, part, prevLink, nextLink) {
  const bodyHtml = articleBodyHtml(article.blocks, '../images/');
  const rt = readingTime(article.blocks);
  const hasCharts = article.blocks.some(b => b.type === 'embed');
  // Рисующий скрипт для статей с интерактивными графиками — по номеру статьи
  const CHARTS_JS = { '02': 'charts-konv.js', '05': 'charts-dvizh.js', '08': 'charts-mgr.js' };
  const chartsFile = CHARTS_JS[article.num];
  const extraHead = hasCharts ? CHARTS_CSS : '';
  const extraBody = hasCharts && chartsFile
    ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>\n<script src="../assets/${chartsFile}" charset="utf-8"></script>`
    : '';

  const content = `
<article class="article">
  <div class="container">
    <nav class="article__breadcrumb">
      <a href="../index.html">Главная</a>
      <span>→</span>
      <a href="../index.html#part-${part.number.toLowerCase()}">Часть ${part.number}. ${esc(part.title)}</a>
      <span>→</span>
      Глава ${chapterIdx}
    </nav>
    <header class="article__header">
      <div class="article__part">Часть ${part.number}. ${esc(part.title)} · Глава ${chapterIdx}</div>
      <h1 class="article__title">${esc(article.title)}</h1>
      <div class="article__meta">
        <span>~${rt} мин чтения</span>
        ${article.url ? `<span>Оригинал: <a href="${esc(article.url)}" target="_blank" rel="noopener">${esc(article.url.replace(/^https?:\/\//, ''))}</a></span>` : ''}
      </div>
    </header>
    <div class="article__body">
      ${bodyHtml}
    </div>

    ${article.url ? `<p class="article__cta">
      Прочитать на Дзене и оставить комментарий: <a href="${esc(article.url)}" target="_blank" rel="noopener">${esc(article.url.replace(/^https?:\/\//, ''))}</a>
    </p>` : ''}

    <nav class="chapter-nav">
      ${prevLink
        ? `<a class="chapter-nav__item" href="${prevLink.href}"><div class="chapter-nav__direction">← ${esc(prevLink.kicker)}</div><div class="chapter-nav__title">${esc(prevLink.title)}</div></a>`
        : `<a class="chapter-nav__item" href="../index.html#preface"><div class="chapter-nav__direction">← Назад</div><div class="chapter-nav__title">К предисловию</div></a>`
      }
      ${nextLink
        ? `<a class="chapter-nav__item chapter-nav__item--next" href="${nextLink.href}"><div class="chapter-nav__direction">${esc(nextLink.kicker)} →</div><div class="chapter-nav__title">${esc(nextLink.title)}</div></a>`
        : `<a class="chapter-nav__item chapter-nav__item--next" href="../conclusion.html"><div class="chapter-nav__direction">Дальше →</div><div class="chapter-nav__title">Заключение</div></a>`
      }
    </nav>
  </div>
</article>
`;

  return pageLayout({
    title: article.title,
    ogDesc: `Часть ${part.number}. ${part.title} · Глава ${chapterIdx}`,
    content,
    depth: 1,
    active: `article:${String(chapterIdx).padStart(2, '0')}`,
    includeProgress: true,
    extraHead,
    extraBody
  });
}

// ── Сборка ───────────────────────────────────────────────────────
function build() {
  const articlesByNum = {};
  for (const num of META.parts.flatMap(p => p.articles)) {

    articlesByNum[num] = parseArticle(num);
  }
  GLOBAL_ARTICLES = articlesByNum;

  const order = [];
  let counter = 0;
  for (const part of META.parts) {
    for (const num of part.articles) {
      counter++;
      order.push({ chapterIdx: counter, num, part });
    }
  }

  fs.writeFileSync(path.join(BASE, 'index.html'), renderIndex(articlesByNum), 'utf8');
  fs.writeFileSync(path.join(BASE, 'about.html'), renderAbout(), 'utf8');
  fs.writeFileSync(path.join(BASE, 'conclusion.html'), renderConclusion(articlesByNum), 'utf8');

  for (let i = 0; i < order.length; i++) {
    const o = order[i];
    const a = articlesByNum[o.num];
    const fname = `${String(o.chapterIdx).padStart(2, '0')}.html`;
    const prev = i > 0 ? {
      href: `${String(order[i - 1].chapterIdx).padStart(2, '0')}.html`,
      kicker: `Глава ${order[i - 1].chapterIdx}`,
      title: articlesByNum[order[i - 1].num].title
    } : null;
    const next = i < order.length - 1 ? {
      href: `${String(order[i + 1].chapterIdx).padStart(2, '0')}.html`,
      kicker: `Глава ${order[i + 1].chapterIdx}`,
      title: articlesByNum[order[i + 1].num].title
    } : null;
    fs.writeFileSync(
      path.join(ART_OUT, fname),
      renderArticle(o.chapterIdx, a, o.part, prev, next),
      'utf8'
    );
  }

  // Старая preface.html — оставим как редирект на главную #preface
  fs.writeFileSync(path.join(BASE, 'preface.html'), `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=index.html#preface"><title>Предисловие — ${esc(SITE_TITLE)}</title></head>
<body><p>Предисловие теперь на <a href="index.html#preface">главной</a>.</p></body></html>`, 'utf8');


  fs.writeFileSync(path.join(BASE, '.nojekyll'), '', 'utf8');
  fs.writeFileSync(path.join(BASE, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');

  const today = new Date().toISOString().slice(0, 10);
  const baseUrl = 'https://abdublinn.github.io/yazyk-deneg/';
  const urls = [
    'index.html', 'about.html', 'conclusion.html',
    ...order.map(o => `articles/${String(o.chapterIdx).padStart(2, '0')}.html`)
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${baseUrl}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(BASE, 'sitemap.xml'), sitemap, 'utf8');

  console.log(`OK pages: index, about, conclusion, ${order.length} articles`);
}

build();
