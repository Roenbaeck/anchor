package anchormodeler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.ServletException;
import javax.servlet.http.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;


@SuppressWarnings("serial")
public class AnchormodelerServlet extends HttpServlet {

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");
		resp.getWriter().println("Anchormodeler server");
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		//resp.setContentType("text/html");

		//This is needed in combination with doOptions to allow cross-site-scripting
		//http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
		resp.setHeader("Access-Control-Allow-Origin", "*");
		
		ServletFileUpload upload = new ServletFileUpload();
		AnchorRequest areq = new AnchorRequest();
		try {
			FileItemIterator iterator = upload.getItemIterator(req);
			while (iterator.hasNext()) {
				FileItemStream item = iterator.next();
				if(item.isFormField()) {
					BufferedReader reader = new BufferedReader(new InputStreamReader(item.openStream()));
					String value = reader.readLine();
					areq.stringParams.put(item.getFieldName(), value);
				} else {	
					areq.fileParams.put(item.getFieldName(),item);
				}
			}

			UserService userService = UserServiceFactory.getUserService();
	        if (req.getUserPrincipal()!=null) {
	           areq.user = userService.getCurrentUser();
	        } else {
	        	//if a google account is required then return LOGIN:loginurl
	        	areq.requireLoginMessage="LOGIN: " + userService.createLoginURL(req.getRequestURI());
	        }

		
			String action = areq.stringParams.get("action");
			action=(action == null) ? "" : action;
			action=action.toLowerCase();
			
			if (action.equals("save")) {
				actionSave(areq, resp); 
			} else if (action.equals("load")) {
				actionLoad(areq, resp);
			} else if (action.equals("list")) {
				actionList(areq, resp);
			} else {
				resp.getWriter().println("ERROR: unknown action");
			}
			
		} catch (Exception e) {
			resp.getWriter().println("ERROR: " + e.toString());
		}
	}

	@Override
	protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		//http://code.google.com/p/googleappengine/issues/detail?id=2994
		// CORS requires that browsers do an OPTIONS request before allowing
		// cross-site POSTs. UMP does not require this, but no browser
		// implements
		// UMP at this time. So, we reply to the OPTIONS request to trick
		// browsers into effectively implementing UMP.
		String s;
		
		s = req.getParameter("Origin");
		if(s!=null)
			resp.setHeader("Access-Control-Allow-Origin", s);
		else
			resp.setHeader("Access-Control-Allow-Origin", "*");

		resp.setHeader("Access-Control-Allow-Methods", "POST");

		s = req.getParameter("Access-Control-Request-Headers");
		if(s!=null)
			resp.setHeader("Access-Control-Allow-Headers", s);
		else
			resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
		
		resp.setHeader("Access-Control-Allow-Credentials", "true");
		resp.setHeader("Access-Control-Max-Age", "86400");
	}

	private void actionSave(AnchorRequest areq, HttpServletResponse resp) throws ServletException, IOException {
		/*
		 * scope "public","private" 
		 * modelName 
		 * modelId (om nytt dokument så slopar man detta, annars overwrite model med detta id) 
		 * keywords 
		 * icon (textencoded png-image)
		 * modelXml
		 * 
		 * returnerar ok/error
		 */
		
		/*if(areq.user==null) {
            resp.getWriter().println(areq.requireLoginMessage);
			return;
		}*/
		
		//TODO: more data to save
		String modelName = areq.stringParams.get("modelName");
		String modelXml = areq.stringParams.get("modelXml");
		String icon = areq.stringParams.get("icon");
		String keywords = areq.stringParams.get("keywords");
		String scope = areq.stringParams.get("scope");
		//String userId = areq.user.getUserId();

		Model m = new Model();
		m.setModelName(modelName);
		m.setModelXml(new Text(modelXml));
		m.setIcon(new Text(icon));
		//m.setUserId(userId);
		m.setKeywords(keywords);
		m.setPublic( (scope!=null) && (scope.equalsIgnoreCase("public")) );
		
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(m);
		} finally {
			pm.close();
		}
		resp.getWriter().println("OK");
	}
	
	private void actionLoad(AnchorRequest areq, HttpServletResponse resp) throws IOException {
		String modelId = areq.stringParams.get("modelId");
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Key key = KeyFactory.stringToKey(modelId);
			Model m = (Model)pm.getObjectById(Model.class, key);
			resp.getWriter().println( m.getModelXml().getValue() );
		} finally {
			pm.close();
		}
	}

	@SuppressWarnings("unchecked")
	private void actionList(AnchorRequest areq, HttpServletResponse resp) throws Exception {
		/*list
		  scope "public","private","public/private"
		  filterBy "keyword"
		  filterValue "lkslejg"
		  maxItemsReturned 20
		
		  returnerar i xmlformat
		    modelId, modelName, icon, domain, keyword, authorName
		*/

		//TODO: more parameters
		
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Query query=null;
	    try {
		    query = pm.newQuery(Model.class);
		    //query.setFilter("lastName == lastNameParam");
		    //query.setOrdering("hireDate desc");
		    //query.declareParameters("String lastNameParam");
		    
			//Format as xml http://www.roseindia.net/servlets/xm-servlet.shtml
		    DocumentBuilderFactory builderFactory = DocumentBuilderFactory.newInstance();
	        DocumentBuilder docBuilder = builderFactory.newDocumentBuilder();
	        //creating a new instance of a DOM to build a DOM tree.
	        Document doc = docBuilder.newDocument();
	        Element root = doc.createElement("Models");
	        doc.appendChild(root);
		    
	        List<Model> results = (List<Model>) query.execute();
            for (Model m : results) {
            	Element child = doc.createElement("Model");
            	child.setAttribute("modelName", m.getModelName());
            	child.setAttribute("modelId", KeyFactory.keyToString(m.getKey()) );
            	child.setAttribute("icon", m.getIcon().getValue() );
            	root.appendChild(child);
            }
            
            TransformerFactory factory = TransformerFactory.newInstance();
            Transformer transformer = factory.newTransformer();
           
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");

            // create string from xml tree
            StringWriter sw = new StringWriter();
            StreamResult result = new StreamResult(sw);
            DOMSource source = new DOMSource(doc);
            transformer.transform(source, result);
            String xmlString = sw.toString();
            
            resp.getWriter().println(xmlString);
            
	    } finally {
	        if(query!=null)
	        	query.closeAll();
			pm.close();
	    }		

	}
	
}
