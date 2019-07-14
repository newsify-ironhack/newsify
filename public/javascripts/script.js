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
  }else{
    $(`#${theCard.id} > i`).removeClass('fas').addClass('far');
    $(`#${theCard.id}`).css('pointer-events', 'none')
  }

  setTimeout(() => {
    $(`#${theCard.id}`).css('pointer-events', 'all')
  }, 1000)

}
