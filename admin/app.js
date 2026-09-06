const PK="be_products",CK="be_categories",HK="be_homepage",SK="be_settings";

const products=[
{id:"BE001",name:"White Marble Tile",category:"Tiles",price:45,unit:"sq.ft",size:"4 x 2 ft",finish:"Glossy",color:"White",material:"Ceramic",code:"BE001",description:"Premium white marble finish tile.",image:"",visible:true,featured:true,newArrival:false},
{id:"BE002",name:"Granite Slab",category:"Granite",price:120,unit:"sq.ft",size:"8 x 4 ft",finish:"Polished",color:"Black",material:"Granite",code:"BE002",description:"Premium polished granite slab.",image:"",visible:true,featured:false,newArrival:true},
{id:"BE003",name:"Wooden Flooring",category:"Flooring",price:85,unit:"sq.ft",size:"6 x 4 ft",finish:"Matt",color:"Brown",material:"Ceramic",code:"BE003",description:"Elegant wooden look flooring.",image:"",visible:true,featured:true,newArrival:true}
];

const cats=["Tiles","Granite","Marble","Flooring","Wall Tiles","Bathroom","Kitchen","Others"];

const homepage={heroHeading:"Quality Tiles for a Better Tomorrow",heroDescription:"Premium tiles, granite and marble for your dream space.",heroImage:"",showCategories:true,showFeatured:true,showAbout:true};

const settings={shopName:"Bharat Enterprises",tagline:"Tiles & Marbles",phone:"",whatsapp:"",address:"",openingHours:"Mon - Sun: 9:00 AM - 8:00 PM",email:"",websiteOnline:true,whatsappButton:true,productPrices:true};

function get(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function put(k,d){localStorage.setItem(k,JSON.stringify(d))}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

let P=get(PK,products),C=get(CK,cats);

function openSection(s){
 document.querySelectorAll(".page-section").forEach(x=>x.classList.remove("active"));
 document.getElementById(s)?.classList.add("active");
 document.querySelectorAll(".nav-link").forEach(x=>x.classList.toggle("active",x.dataset.section==s));
 let n={dashboard:"Dashboard",products:"Products",categories:"Categories",homepage:"Homepage",enquiries:"Enquiries",settings:"Website Settings"}[s];
 document.getElementById("pageTitle").textContent=n||"Dashboard";
 if(s=="dashboard")dash();
 if(s=="products")render();
 if(s=="categories")category();
 if(s=="homepage")loadHome();
 if(s=="settings")loadSettings();
 document.getElementById("sidebar")?.classList.remove("open");
}

document.querySelectorAll(".nav-link").forEach(x=>x.onclick=()=>openSection(x.dataset.section));

function toggleSidebar(){document.getElementById("sidebar").classList.toggle("open")}

function dash(){
 totalProducts.textContent=P.length;
 visibleProducts.textContent=P.filter(x=>x.visible).length;
 featuredProducts.textContent=P.filter(x=>x.featured).length;
 totalCategories.textContent=C.length;
 let t=document.getElementById("recentProducts");
 t.innerHTML=rows(P.slice(0,8));
}

function rows(a){
 return a.length?a.map(p=>`
<tr>
<td>${p.image?`<img class="product-thumb" src="${esc(p.image)}">`:`<div class="product-thumb"></div>`}</td>
<td><strong>${esc(p.name)}</strong><br><small>${esc(p.code)}</small></td>
<td>${esc(p.category)}</td>
<td>₹ ${p.price} / ${esc(p.unit)}</td>
<td><span class="status ${p.visible?"visible":"hidden"}">${p.visible?"Visible":"Hidden"}</span></td>
<td><div class="action-buttons">
<button class="action-btn" onclick="editProduct('${p.id}')">✎</button>
<button class="action-btn" onclick="toggleProduct('${p.id}')">◉</button>
<button class="action-btn delete" onclick="deleteProduct('${p.id}')">×</button>
</div></td>
</tr>`).join(""):`<tr><td colspan="6" style="text-align:center;padding:30px">No products found.</td></tr>`;
}

function options(){
 productCategory.innerHTML=C.map(x=>`<option>${esc(x)}</option>`).join("");
 productCategoryFilter.innerHTML=`<option value="">All Categories</option>`+C.map(x=>`<option>${esc(x)}</option>`).join("");
}

function render(){
 let q=(productSearch.value||"").toLowerCase(),c=productCategoryFilter.value,s=productStatusFilter.value;
 let a=P.filter(p=>(p.name+" "+p.category+" "+p.code).toLowerCase().includes(q));
 if(c)a=a.filter(p=>p.category==c);
 if(s=="visible")a=a.filter(p=>p.visible);
 if(s=="hidden")a=a.filter(p=>!p.visible);
 productsTable.innerHTML=rows(a);
}

productSearch.oninput=render;
productCategoryFilter.onchange=render;
productStatusFilter.onchange=render;

function openProductModal(id){
 productForm.reset();
 productId.value="";
 productVisible.checked=true;
 imagePreview.innerHTML="";
 productImage.value="";
 options();
 modalTitle.textContent="Add Product";
 productModal.classList.add("active");
 if(id)editProduct(id);
}

function closeProductModal(){productModal.classList.remove("active")}

productImageFile.onchange=e=>{
 let f=e.target.files[0];
 if(!f)return;
 if(!f.type.startsWith("image/"))return alert("Please select an image.");
 if(f.size>5*1024*1024)return alert("Image must be less than 5MB.");
 let r=new FileReader();
 r.onload=()=>{productImage.value=r.result;imagePreview.innerHTML=`<img src="${r.result}">`};
 r.readAsDataURL(f);
};

productForm.onsubmit=e=>{
 e.preventDefault();
 let id=productId.value||"BE"+Date.now().toString().slice(-6);
 let p={
 id,
 name:productName.value.trim(),
 category:productCategory.value,
 price:+productPrice.value||0,
 unit:productUnit.value,
 size:productSize.value,
 finish:productFinish.value,
 color:productColor.value,
 material:productMaterial.value,
 code:productCode.value,
 description:productDescription.value,
 image:productImage.value,
 visible:productVisible.checked,
 featured:productFeatured.checked,
 newArrival:productNewArrival.checked
 };
 if(!p.name)return alert("Enter product name.");
 let i=P.findIndex(x=>x.id==id);
 i>=0?P[i]=p:P.unshift(p);
 put(PK,P);closeProductModal();dash();render();
 alert(i>=0?"Product updated!":"Product added!");
};

function editProduct(id){
 let p=P.find(x=>x.id==id);if(!p)return;
 openProductModal();
 productId.value=p.id;
 productName.value=p.name;
 productCategory.value=p.category;
 productPrice.value=p.price;
 productUnit.value=p.unit;
 productSize.value=p.size||"";
 productFinish.value=p.finish||"";
 productColor.value=p.color||"";
 productMaterial.value=p.material||"";
 productCode.value=p.code||"";
 productDescription.value=p.description||"";
 productImage.value=p.image||"";
 productVisible.checked=p.visible!==false;
 productFeatured.checked=!!p.featured;
 productNewArrival.checked=!!p.newArrival;
 modalTitle.textContent="Edit Product";
 if(p.image)imagePreview.innerHTML=`<img src="${esc(p.image)}">`;
}

function toggleProduct(id){
 let p=P.find(x=>x.id==id);if(!p)return;
 p.visible=!p.visible;put(PK,P);dash();render();
}

function deleteProduct(id){
 let p=P.find(x=>x.id==id);if(!p)return;
 if(confirm(`Delete "${p.name}"?`)){
  P=P.filter(x=>x.id!=id);put(PK,P);dash();render();
 }
}

function category(){
 categoriesList.innerHTML=C.map(x=>`
<div class="category-card"><div><strong>${esc(x)}</strong><small>${P.filter(p=>p.category==x).length} products</small></div>
<div class="action-buttons"><button class="action-btn" onclick="renameCategory('${esc(x)}')">✎</button>
<button class="action-btn delete" onclick="deleteCategory('${esc(x)}')">×</button></div></div>`).join("");
}

function addCategoryPrompt(){
 let x=prompt("New category name:")?.trim();
 if(!x||C.some(c=>c.toLowerCase()==x.toLowerCase()))return;
 C.push(x);put(CK,C);category();options();
}

function renameCategory(old){
 let x=prompt("New category name:",old)?.trim();
 if(!x||C.includes(x))return;
 C[C.indexOf(old)]=x;P.forEach(p=>{if(p.category==old)p.category=x});
 put(CK,C);put(PK,P);category();options();render();
}

function deleteCategory(x){
 if(P.some(p=>p.category==x))return alert("Delete or move products from this category first.");
 if(confirm(`Delete "${x}"?`)){C=C.filter(c=>c!=x);put(CK,C);category();options();}
}

function loadHome(){
 let h=get(HK,homepage);
 heroHeading.value=h.heroHeading;heroDescription.value=h.heroDescription;
 heroImage.value=h.heroImage;showCategories.checked=h.showCategories;
 showFeatured.checked=h.showFeatured;showAbout.checked=h.showAbout;
}

function saveHomepage(){
 put(HK,{heroHeading:heroHeading.value,heroDescription:heroDescription.value,heroImage:heroImage.value,showCategories:showCategories.checked,showFeatured:showFeatured.checked,showAbout:showAbout.checked});
 alert("Homepage saved!");
}

function loadSettings(){
 let s=get(SK,settings);
 shopName.value=s.shopName;tagline.value=s.tagline;phone.value=s.phone;
 whatsapp.value=s.whatsapp;address.value=s.address;openingHours.value=s.openingHours;
 email.value=s.email;websiteOnline.checked=s.websiteOnline;
 whatsappButton.checked=s.whatsappButton;productPrices.checked=s.productPrices;
}

function saveSettings(){
 put(SK,{shopName:shopName.value,tagline:tagline.value,phone:phone.value,whatsapp:whatsapp.value,address:address.value,openingHours:openingHours.value,email:email.value,websiteOnline:websiteOnline.checked,whatsappButton:whatsappButton.checked,productPrices:productPrices.checked});
 alert("Settings saved!");
}

function logout(){alert("Secure login will be added later.")}

document.addEventListener("DOMContentLoaded",()=>{
 if(!localStorage.getItem(PK))put(PK,P);
 if(!localStorage.getItem(CK))put(CK,C);
 if(!localStorage.getItem(HK))put(HK,homepage);
 if(!localStorage.getItem(SK))put(SK,settings);
 P=get(PK,products);C=get(CK,cats);
 options();dash();render();category();loadHome();loadSettings();
 currentDate.textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
});
