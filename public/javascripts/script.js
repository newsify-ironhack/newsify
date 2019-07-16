document.addEventListener('DOMContentLoaded', () => {
  var elems = document.querySelectorAll('.dropdown-trigger');
  var instances = M.Dropdown.init(elems);
  var modalElems = document.querySelectorAll('.modal');
  var modalInstances = M.Modal.init(modalElems,{});
  console.log('test');

  var i = 0;
  var txt = 'Newsify';
  var speed = 300;
  typeWriter();
  function typeWriter() {
    if (i < txt.length) {
      document.getElementById("newsify-text").innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
  
}, false);

function toggleBookmark(theCard){
  if($(`#${theCard.id} > i`).hasClass('far')){
  $(`#${theCard.id} > i`).removeClass('far').addClass('fas');
  $(`#${theCard.id}`).css('pointer-events', 'none')
  let fullCard = $(`#card${theCard.id}`);
  let children = fullCard.children();
  let imageDiv = children[0];
  let imageUrl = $(imageDiv).find('img').attr('src');
  let contentDiv = children[1];
  let newsTitle = $(contentDiv).find('h5').html();
  let readMoreDiv = $(`#readmore-modal${theCard.id}`);
  let readMoreContent = readMoreDiv.children();
  readMoreContent = readMoreContent[0];
  let newsDescription = $(readMoreContent).find('p').html();
  let newsAuthor = $(readMoreContent).find('.right-align').find('.author').html();
  let newsDate = $(readMoreContent).find('.right-align').find('.date').html();
  let urlToArticle = $(readMoreContent).find('.center-align').find('a').attr('href');
  if(newsAuthor == 'undefined'){
    newsAuthor = 'unknown author'
  }
  let article = {
    title: newsTitle,
    description: newsDescription,
    picture: imageUrl,
    author: newsAuthor,
    articleUrl: urlToArticle,
    articleDate: newsDate
  }
  axios.post('/news/create',article)
  .then((response)=>{
    console.log(response);
  })
  .catch((err)=>{
    console.log(err);
  })
  }else{
    $(`#${theCard.id} > i`).removeClass('fas').addClass('far');
    $(`#${theCard.id}`).css('pointer-events', 'none');
    let fullCard = $(`#card${theCard.id}`);
    let children = fullCard.children();
    let contentDiv = children[1];
    let newsTitle = $(contentDiv).find('h5').html();
    axios.post('/news/delete',{title: newsTitle})
    .then((response)=>{
      console.log(response);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  setTimeout(() => {
    $(`#${theCard.id}`).css('pointer-events', 'all')
  }, 1000)

}

function postComment(button) {
  const id = button.parentElement.id;
  const newTitle = document.getElementById(`title-card-${id}`).innerText;
  const input = document.getElementById(`comment-input-${id}`)
  
  const body  = {
    title: newTitle,
    content: input.value
  }
  if(input.value.length >= 0) {
    axios.post('comment/create', body)
      .then(res => {
        input.value = '';
      })
      .catch(err => {
        console.log(err)
      })
  }
}

function toggleLike(btn) {
  const id = btn.parentElement.parentElement.id;
  const newTitle = document.getElementById(`title-card-${id}`).innerText;

  const thumbIcon = btn.firstElementChild;

  if(thumbIcon.classList.contains('far')) {
    thumbIcon.classList.remove('far')
    thumbIcon.classList.add('fas')

    axios.post('/likes/add', {title: newTitle})
      .then(() => {
        console.log('liked')
      })
      .catch(err => {
        console.log(err)
      })

    // const getLikes = Number(btn.innerText.split(' ')[0])
    // const icon = document.createElement('i');
    // icon.innerHTML = '';
    // icon.classList.add('far');
    // icon.classList.add('fa-thumbs-up')

    // btn.appendChild(icon)
    // btn.innerText = `${getLikes + 1} Likes`

  } else {
    thumbIcon.classList.remove('fas')
    thumbIcon.classList.add('far')

    axios.post('/likes/remove', {title: newTitle})
      .then(() => {
        console.log('deleted')
      })
      .catch(err => {
        console.log(err)
      })

      // const getLikes = Number(btn.innerText.split(' ')[0])
      // const icon = document.createElement('i');
      // icon.innerHTML = '';
      // icon.classList.add('fas')
      // icon.classList.add('fa-thumbs-up')

      // btn.appendChild(icon)
      // btn.innerText = `${getLikes - 1} Likes`
  }
}

function showComments(btn) {
  const id = btn.id.split('-')[1]

  document.getElementById(`comments-section-${id}`).classList.remove('hide')
  document.getElementById(`comment-form-${id}`).classList.remove('hide')

  btn.classList.add('hide')
  document.getElementById(`hide-${id}`).classList.remove('hide')
}

function hideComments(btn) {
  const id = btn.id.split('-')[1]

  document.getElementById(`comments-section-${id}`).classList.add('hide')
  document.getElementById(`comment-form-${id}`).classList.add('hide')

  btn.classList.add('hide')
  document.getElementById(`show-${id}`).classList.remove('hide')
}
