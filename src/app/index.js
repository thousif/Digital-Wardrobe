import React, { Component } from 'react'
import { List, 
	Avatar, 
	Button, 
	Spin, 
	Upload, 
	Icon, 
	Modal , 
	Layout, 
	Menu,
	message, 
	DatePicker,
	notification } from 'antd'
import moment from 'moment'
import './index.css'
const { Header, Footer, Content } = Layout;
const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

class App extends Component {
  constructor(props){
    super(props);
    console.log(this.props);
    this.state =  {
	    date : moment().format('YYYYMMDD'),
	    day : {
	    	title : moment().calendar(null, {
			    sameDay: '[Today]',
			    nextDay: '[Tomorrow]',
			    nextWeek: 'dddd',
			    lastDay: '[Yesterday]',
			    lastWeek: '[Last] dddd',
			    sameElse: 'DD/MM/YYYY'
			}) 
	    },
	    previewVisible: false,
	    previewImage: '',
	    fileList: [],
	}
  }


  // function to retreive base64 of the uploaded image
  getBase64FromImageUrl = (file,cb) => {
    var fileReader = new FileReader();

    fileReader.onload=function(e) {
        var image = new Image();

        image.src = e.target.result;

        image.onload=function(){

            var MAXWidthHeight = 800;
            var resolution = MAXWidthHeight/Math.max(this.width,this.height),

            width = Math.round(this.width*resolution),
            height = Math.round(this.height*resolution),
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            canvas.getContext("2d").drawImage(this,0,0,width,height);

            var dataUrl = canvas.toDataURL("image/jpeg",0.8);
            
            cb({
            	url : dataUrl,
            	uid : file.uid,
            	name : file.name
            });
        }
    }

	fileReader.readAsDataURL(file);
  }

  componentDidMount() {
    // lets start
    // check if there is an existing database and update state .
    this.getStore();
  }

  getStore = () => {
  	console.log("fetching all stored images");
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    message.error("Your browser does not support this feature. please update to access.");
	    return;
	}

	// since 
	const self = this;

	const open = indexedDB.open('myDatabase', 1 ,function(upgrade){
		console.log("upgrade",upgrade);
	});

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
	    var index = store.createIndex("date" , "date" , {unique : false});
	};

  	open.onerror = (err) => {
	    message.error("Error fetching data.");
  		console.log(err);
  	}

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("MyObjectStore", "readwrite");
	    var store = tx.objectStore("MyObjectStore");
	    var index = store.index("date");

	    var getAll = index.getAll(self.state.date);
	    
	    getAll.onsuccess = function() {
	    	console.log(getAll);
	   		if(getAll.result && getAll.result.length >= 0){
	   			let fileList = getAll.result.map(data => data.uri);
	   			self.setState({
	   				...self.state,
	   				fileList
	   			})
	   		}
	    };

	    getAll.onerror = function() {
	    	message.error("Error! Try again later");
	    	console.log(getAll.error);
	    }

	    tx.oncomplete = function() {
	        db.close();
	    };
	}		
  }

  storeToDB = (file) => {
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    message.error("Your browser does not support this feature. please update to access.");
	    return;
	}

	const self = this;

	file = {
		...file,
		status : 'done'
	}
	
	const open = indexedDB.open('myDatabase', 1);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
	    var index = store.createIndex("date" , "date" , {unique : false});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("MyObjectStore", "readwrite");
	    var store = tx.objectStore("MyObjectStore");
	    var index = store.index("date");

	    store.put({id: file.uid , uri : file , date : self.state.date});

	    var saveImage = index.get(file.uid);

	    saveImage.onsuccess = function() {
	    	
	    	message.success("Successfully uploaded the image.")

	    	let {fileList} = self.state;

			let target = fileList.findIndex(f => f.uid == file.uid);

			if(target >= 0){
				fileList[target] = file;

				self.setState({
					...this.state,
					fileList
				})
			} else {
				console.log("Invalid target id");
			}

	    };

	    saveImage.onerror = function() {
	    	message.error("Error uploading the image.")
	    	console.log(saveImage.error);
	    }

	    tx.oncomplete = function() {
	        db.close();
	    };
	}		
  }

  deleteFromDB = (file) => {
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    message.error("Your browser does not support this feature. please update to access.");
	    return;
	}

	const self = this;
	
	const open = indexedDB.open('myDatabase', 1);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
	    var index = store.createIndex("date" , "date" , {unique : false});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("MyObjectStore", "readwrite");
	    var store = tx.objectStore("MyObjectStore");
	    var index = store.index("date");

	    store.put({id: file.uid , uri : file , date : self.state.date});

	    var getImage = store.delete(file.uid);

	    getImage.onsuccess = function() {
	    	console.log("deleted from db");
	    	message.success("Successfully deleted the image.")
	    };

	    getImage.onerror = function() {
	    	message.error("Error deleting the image.")
	    	console.log(getImage.error);
	    }

	    tx.oncomplete = function() {
	        db.close();
	    };
	}	
  }


  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleUpload = (file) => {
  	if(file.type)
  	this.getBase64FromImageUrl(file.file,this.storeToDB)
  }

  handleChange = ({file, fileList }) => {
  	console.log(fileList);
  	if(file.status == "removed"){
  		this.deleteFromDB(file);
  	}
  	this.setState({ fileList })
  }

  handleDateChange = (t) => {
  	console.log(moment(t).format('YYYYMMDD'));
  	this.setState({
  		...this.state,
  		date : moment(t).format('YYYYMMDD'),
  		day : {
	    	title : moment(t).calendar(null, {
			    sameDay: '[Today]',
			    nextDay: '[Tomorrow]',
			    nextWeek: 'dddd',
			    lastDay: '[Yesterday]',
			    lastWeek: '[Last] dddd',
			    sameElse: 'DD/MM/YYYY'
			}) 
	    },
  	},function(){
  		this.getStore();
  	})
  }

  previousDay = () => {
  	let date = moment(this.state.date).subtract(1,'days').format('YYYYMMDD')
  	this.setState({
  		...this.state,
  		date,
	    day : {
	    	title : moment(date).calendar(null, {
			    sameDay: '[Today]',
			    nextDay: '[Tomorrow]',
			    nextWeek: 'dddd',
			    lastDay: '[Yesterday]',
			    lastWeek: '[Last] dddd',
			    sameElse: 'DD/MM/YYYY'
			}) 
	    },
  	},function(){
  		this.getStore()
  	})
  }

  nextDay = () => {
  	let date = moment(this.state.date).add(1,'days').format('YYYYMMDD')
  	this.setState({
  		...this.state,
  		date,
	    day : {
	    	title : moment(date).calendar(null, {
			    sameDay: '[Today]',
			    nextDay: '[Tomorrow]',
			    nextWeek: 'dddd',
			    lastDay: '[Yesterday]',
			    lastWeek: '[Last] dddd',
			    sameElse: 'DD/MM/YYYY'
			}) 
	    },
  	},function(){
  		this.getStore()
  	})
  }

  render() {
    const { loading, loadingMore, showLoadingMore, day } = this.state;
    const loadMore = showLoadingMore ? (
      <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
        {loadingMore && <Spin />}
        {!loadingMore && <Button onClick={this.onLoadMore}>loading more</Button>}
      </div>
    ) : null;
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div >
      	<Layout className="layout">
        	<Header className="header">
        		<h1 className="title">Digital Wardrobe</h1>
        		<hr className="title-bar"/>
        	</Header>
        	<Content className="content">
        		<List
			        className="loadmore-list"
			        itemLayout="horizontal"
			        >
		          <List.Item actions={[<a><Icon type="left" onClick={()=>this.previousDay()} /></a>, <a><Icon type="right" onClick={()=>this.nextDay()}/></a>]}>
		            <List.Item.Meta
		              avatar={<Avatar style={{backgroundColor : colorList[0] ,verticalAlign: 'middle'}} size="large">{day.title.slice(0,2)}</Avatar>}
		              title={<a href="">{day.title}</a>}
		              description={moment(this.state.date).format("MMM Do YY")}
		            />
		            <div><DatePicker value={moment(this.state.date)} onChange={this.handleDateChange} placeholder="Select Date" /></div>
		          </List.Item>
		          <div className="img-container"> 
			        <Upload
			          customRequest = {this.handleUpload}
			          listType="picture-card"
			          accept="image/*"
			          fileList={fileList}
			          onPreview={this.handlePreview}
			          onChange={this.handleChange}
			        >
			          {uploadButton}
			        </Upload>
			        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
			          <img alt="example" style={{ width: '100%' }} src={previewImage} />
			        </Modal>
		          </div>
			    </List>
			   
        	</Content>
        	{/*<Footer className="footer">Footer</Footer>*/}
      	</Layout>
      </div>
    );
  }
}

export default App;
