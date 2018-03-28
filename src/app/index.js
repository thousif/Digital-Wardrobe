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
	    loading: true,
	    loadingMore: false,
	    showLoadingMore: true,
	    data: [],
	    previewVisible: false,
	    previewImage: '',
	    fileList: [{
	      uid: -1,
	      name: 'xxx.png',
	      status: 'done',
	      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
	    }],
	}
  }

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
	
	console.log(file);

	fileReader.readAsDataURL(file);
    // img.src = url;
  }

  componentDidMount() {
    // this.getData((res) => {
    //   this.setState({
    //     loading: false,
    //     data: res.results,
    //   });
    // });

    this.setState({
    	...this.state,
    	loading : false,
    	store : 'd' + moment().format('YYYYMMDD'),
    	data : [{
    		title : 'Today',
    		name : {
    			last : 'jay'
    		}
    	}]
    })

	// this.getBase64FromImageUrl(this.state.fileList[0].url,this.storeToDB)

  }

  storeToDB = (file) => {
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    return;
	}

	const self = this;

	file = {
		...file,
		status : 'done'
	}
	
	const open = indexedDB.open('myDatabase', 1);

	const storeObjectName = this.state.store;

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
	    var index = store.createIndex(storeObjectName , storeObjectName , {unique : false});
	};

  	open.onsuccess = () => {
	    // Start a new transaction
	    var db = open.result;
	    var tx = db.transaction("MyObjectStore", "readwrite");
	    var store = tx.objectStore("MyObjectStore");
	    var index = store.index(storeObjectName);

	    console.log(index);
	    // // Add some data
	    store.put({id: file.uid , uri : file });
	    // store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});
	    
	    // // Query the data
	    var getJohn = store.get(file.uid);
	    // var getBob = index.get(["Smith", "Bob"]);

	    getJohn.onsuccess = function() {
	        console.log(getJohn);  // => "John"
	    	
	    	let {fileList} = self.state;

			let target = fileList.findIndex(f => f.uid == file.uid);

			fileList[1] = file;

			self.setState({
				...this.state,
				fileList
			})

	    };

	    // getBob.onsuccess = function() {
	    //     console.log(getBob.result.name.first);   // => "Bob"
	    // };

	    // // Close the db when the transaction is done
	    tx.oncomplete = function() {
	        db.close();
	    };
	}		
  }

  getData = (callback) => {
    reqwest({
      url: fakeDataUrl,
      type: 'json',
      method: 'get',
      contentType: 'application/json',
      success: (res) => {
        callback(res);
      },
    });
  }

  onLoadMore = () => {
    // this.setState({
    //   loadingMore: true,
    // });
    // this.getData((res) => {
    //   const data = this.state.data.concat(res.results);
    //   this.setState({
    //     data,
    //     loadingMore: false,
    //   }, () => {
    //     // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
    //     // In real scene, you can using public method of react-virtualized:
    //     // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
    //     window.dispatchEvent(new Event('resize'));
    //   });
    // });
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleUpload = (file) => {
  	console.log(file);
  	this.getBase64FromImageUrl(file.file,this.storeToDB)
  }

  handleChange = ({ fileList }) => {
  	console.log(fileList);
  	this.setState({ fileList })
  }

  render() {
    const { loading, loadingMore, showLoadingMore, data } = this.state;
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
        		<h1 className="title">iClap demo network</h1>
        		<hr className="title-bar"/>
        	</Header>
        	<Content className="content">
        		<List
			        className="loadmore-list"
			        loading={loading}
			        itemLayout="horizontal"
			        loadMore={loadMore}
			        dataSource={data}
			        renderItem={(item,index) => (
			          <div>
				          <List.Item actions={[<a>edit</a>, <a>more</a>]}>
				            <List.Item.Meta
				              avatar={<Avatar style={{backgroundColor : colorList[index] ,verticalAlign: 'middle'}} size="large">{item.title.slice(0,1)}</Avatar>}
				              title={<a href="https://ant.design">{item.title}</a>}
				              description={moment().format("MMM Do YY")}
				            />
				            <div>content</div>
				          </List.Item>
				          <div className="img-container"> 
					        <Upload
					          customRequest = {this.handleUpload}
					          listType="picture-card"
					          fileList={fileList}
					          onPreview={this.handlePreview}
					          onChange={this.handleChange}
					        >
					          {fileList.length >= 3 ? null : uploadButton}
					        </Upload>
					        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
					          <img alt="example" style={{ width: '100%' }} src={previewImage} />
					        </Modal>
				          </div>
			          </div>
			        )}
			    />
        	</Content>
        	<Footer className="footer">Footer</Footer>
      	</Layout>
      </div>
    );
  }
}

export default App;
