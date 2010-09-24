package anchormodeler;

import java.util.HashMap;

import org.apache.commons.fileupload.FileItemStream;

public class AnchorRequest {

	public HashMap<String,FileItemStream> fileParams = new HashMap<String,FileItemStream>(); 
	public HashMap<String,String> stringParams = new HashMap<String,String>(); 

}
