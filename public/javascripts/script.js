document.addEventListener('DOMContentLoaded', () => {
  var elems = document.querySelectorAll('.dropdown-trigger');
  var instances = M.Dropdown.init(elems);
  var modalElems = document.querySelectorAll('.modal');
  var modalInstances = M.Modal.init(modalElems,{
    dismissible: true
  });
  var collapsElems = document.querySelectorAll('.collapsible');
  var collapseInstances = M.Collapsible.init(collapsElems, {});
  var carouselElems = document.querySelectorAll('.carousel');
  var instances = M.Carousel.init(carouselElems, {});
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
  const input = document.getElementById(`comment-input-${id}`)
  console.log('test');
  if(input.value.length >= 0) {
    const newTitle = document.getElementById(`title-card-${id}`).innerText;
    
    const body  = {
      title: newTitle,
      content: input.value
    }
  
    axios.post('/comment/create', body)
      .then(res => {
        console.log(res)
  
        const user = res.data.data.user
  
        const container = document.getElementById(`comments-section-${id}`)
        const newDiv = document.createElement('div')
        newDiv.className = ('col s12')
        newDiv.innerHTML = `<div class="row comment-div">
          <div class="col s2 center-align">
            <img class="circle comment-pictures" src="${user.img}" alt="user-img">
          </div>
  
          <div class="col s10 left-align">
            <div class="row content-section">
              <div class="col s12">
                <span class="user-name-span">${user.name}</span>
                <span>| 4h</span>
              </div>
            </div>
            <div class="row content-section">
              <div class="col s12">
                <p>${input.value}</p>
              </div>
            </div>
          </div>
        </div>`;
  
      container.appendChild(newDiv)
      input.value = ''
      })
      .catch(err => {
        console.log(err)
      })
  }  
}

function toggleLike(btn) {
  console.log(btn)
  const id = btn.parentElement.parentElement.id;
  const newTitle = document.getElementById(`title-card-${id}`).innerText;

  const thumbIcon = btn.firstElementChild;
  const likesNum = btn.lastChild;

  if(thumbIcon.classList.contains('far')) {
    thumbIcon.classList.remove('far')
    thumbIcon.classList.add('fas')

    axios.post('/likes/add', {title: newTitle})
      .then((res) => {
        let getLikes = Number(likesNum.innerText.split(' ')[0]);
        console.log(getLikes)
        btn.innerHTML = "";
        const icon = document.createElement('i')
        icon.className = ('fas fa-thumbs-up')

        const span = document.createElement('span')
        span.textContent = `${getLikes + 1} likes`

        btn.appendChild(icon)
        btn.appendChild(span)
        // btn.innerText = `${getLikes++} likes`
        // console.log(btn.innerText)
        // const icon = document.createElement('i');
        // icon.innerHTML = '';
        // icon.classList.add('far');
        // icon.classList.add('fa-thumbs-up')
    
        // btn.appendChild(icon)
        // btn.innerText = `${getLikes + 1} Likes`
      })
      .catch(err => {
        console.log(err)
      })


  } else {
    thumbIcon.classList.remove('fas')
    thumbIcon.classList.add('far')

    axios.post('/likes/remove', {title: newTitle})
      .then((res) => {
        let getLikes = Number(likesNum.innerText.split(' ')[0]);
        btn.innerHTML = "";
        const icon = document.createElement('i')
        icon.className = ('far fa-thumbs-up')

        const span = document.createElement('span')
        span.textContent = `${getLikes - 1} likes`

        btn.appendChild(icon)
        btn.appendChild(span)
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

let page = 1;
$(window).scroll(function() {
  if($(window).scrollTop() == $(document).height() - $(window).height()) {
    let location = "";
    if(window.location.href.includes('query')){
      location = window.location.href.split('=')
    }else{
      location = window.location.href.split('/');
    }
    let axiosLocation = location[location.length-1];
    page++;
    if(page <=2) {
      axios.get(`${axiosLocation}/${page}`)
      .then((response)=>{ 
        let data = response.data.response;
        console.log(data);
        data.forEach((e,i)=>{
        if(e.urlToImage === null){
          e.urlToImage = '/images/default-article-image.png';
        }
        if(e.author === null){
          e.author = 'Unknown';
        }
        let newDiv = document.createElement('div');
        newDiv.className = ('col s12 m8 push-m2 l4')
        newDiv.innerHTML = `
        <div id="card${i+20}" class="card eachArticle">
      <div class="card-image">
      <div class="center-align">
      <img src="${e.urlToImage}">
      </div>
      </div>
    <div class="card-content">
      <h5>${e.title}</h5>
      <div class="bottom-container">
      <div class="reader-options">
      <a href="#readmore-modal${i+20}" class="waves-effect black btn-small modal-trigger">Read more</a>
      <div id="place-button${i+20}">
      </div>
      </div>
      </div>
    </div>
  </div>
  <div id="readmore-modal${i+20}" class="modal newsmodals" tabindex="0">
  <div class="modal-content">
  <div class="center-align">
    <h4>${e.title}</h4>
  </div>
  <hr>
  <br>
  <p class="description">${e.description}</p>
  <div class="right-align">
    <h6>By: <span class="author">${e.author}</span></h6>
    <h6>Date: <span class="date">${e.publishedAt}</span></h6>
  </div>
  <div class="center-align">
    <a class="waves-effect black btn-small link-article" href="${e.url}" target="_blank">
      <h6>Link to Article</h6>
    </a>
  </div>
</div>  
</div>
          
        `;
      $('#newsContent').append(newDiv);
      if(response.data.user){
      $(`#place-button${i+20}`).append(`     
      <button id="${i+20}" onclick="toggleBookmark(this)" class="btn-floating waves-effect white waves-light"><i class="bookmark-icon far fa-bookmark"></i></button>
      `);
      }
        })
        modalElems = document.querySelectorAll('.modal');
        modalInstances = M.Modal.init(modalElems,{
          dismissible: true
        });
        $('.loader').css('display','none');
      })
      .catch((err)=>{
        console.log(err);
      })
    }
  }
});


function onSendComment(input) {
  const id = input.parentElement.id;
  const btn = document.getElementById(`send-btn-${id}`)
  input.addEventListener('keyup', function(ev) {
    console.log(ev)
    if(ev.keyCode === 13) {
      postComment(btn)
    }
  })
}
function followUser(user){
  console.log(user)
  let bothIds = user.id;
  let arrayIds = bothIds.split(" ");
  console.log(arrayIds);
  let userToFollow = arrayIds[0];
  let userThatIsFollowing = arrayIds[1];
  axios.post('/follow',{arrayIds})
  .then((response)=>{
    console.log(response);
  })
  .catch((err)=>{
    console.log(err);
  })
  if($(user).hasClass('black')){
  $(user).removeClass('black').addClass('blue');
  $(user).text('Following');
}else{
  $(user).removeClass('blue').addClass('black');
  $(user).text('Follow');
}
}


$("#toggle-search").click(function(){
  $("#popup-search").css("display","block")
});

$(document).mouseup(function(e) 
{
    var container = $("#popup-search");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
              container.hide();
    }
});

function initializeWebcam(div) {
  document.getElementById('title-webcam').classList.add('hide');
  document.getElementById('file-row').classList.add('hide');
  div.classList.add('no-borders');
  document.getElementById('snap-cancel-btn').classList.remove('hide')

  Webcam.set({
    width: 320,
		height: 240,
		image_format: 'jpeg',
    jpeg_quality: 90,
		force_flash: false,
		fps: 45
	});

  Webcam.attach('#webcam-container');
}

function freezeCamera() {
  Webcam.freeze();
 
  document.getElementById('webcam-container').lastChild.classList.add('hide')
  document.getElementById('snap-cancel-btn').classList.add('hide')
  document.getElementById('retake-cancel-btn').classList.remove('hide')
}

function unfreezeCamera () {
  Webcam.unfreeze();

  document.getElementById('webcam-container').lastChild.classList.remove('hide')
  document.getElementById('snap-cancel-btn').classList.remove('hide')
  document.getElementById('retake-cancel-btn').classList.add('hide')
}

function shutdownCamera() {
  document.getElementById('snap-cancel-btn').classList.add('hide')
  document.getElementById('retake-cancel-btn').classList.add('hide')
  document.getElementById('title-webcam').classList.remove('hide')
  document.getElementById('file-row').classList.remove('hide');

  Webcam.reset()
}

function getFilename() {
  const filename = document.getElementById('text-filename').value
  
  if(filename) {
    document.getElementById('webcam-row').classList.add('hide')
  } else {
    document.getElementById('webcam-row').classList.remove('hide')
  }
}

function updateProfile() {
  const name = document.getElementById('name');
  const email = document.getElementById('email');

  if(email) {
    if(!name.value || !email.value) {
      name.classList.add('invalid')
      email.classList.add('invalid')
    }
  } else {
    if(!name.value) {
      name.classList.add('invalid')
    }
  }

  const onWebcam = document.getElementById('file-row').classList.contains('hide')

  if(onWebcam) {
    Webcam.snap(function(data_uri) {
      var raw_image_data = data_uri.replace(/^data\:image\/\w+\;base64\,/, '');
      
      document.getElementById('webcamImg').value = raw_image_data;
      document.getElementById('edit-form-modal').submit();
    } );
  } else {
      const fileImg = document.getElementById('fileImg');
      const fakeInput = document.getElementById('fake-input');
      // console.log(fakeInput.files[0])
      if(fakeInput.files[0]) {
        var reader = new FileReader();
        reader.readAsDataURL(fakeInput.files[0]);
        reader.onload = function () {
          fileImg.value = reader.result;
          document.getElementById('edit-form-modal').submit();        
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      } else {
        document.getElementById('edit-form-modal').submit();
      }
  }
} 

function populateForm(el) {
  const credentials = el.parentElement.parentElement

  const name = credentials.getAttribute('fullname')
  const email = credentials.getAttribute('email')
  const username = credentials.getAttribute('username')
  
  const inputName = document.getElementById('name')
  inputName.value = name;
  document.getElementById('name-label').classList.add('active')
  
  if(username) {
    const inputUsername = document.getElementById('username')
    inputUsername.value = username;
    document.getElementById('username-label').classList.add('active')
  }

  if(email) {
    const inputEmail = document.getElementById('email')
    inputEmail.value = email;
    document.getElementById('email-label').classList.add('active')
  }
}
